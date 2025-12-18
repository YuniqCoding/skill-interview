import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InterviewState,
  InterviewStatus,
  UserInfo,
  QAItem,
  InterviewResult,
} from "@/types";

interface InterviewActions {
  // 사용자 정보 설정
  setUserInfo: (info: UserInfo) => void;

  // 상태 변경
  setStatus: (status: InterviewStatus) => void;

  // 후보자 ID 설정
  setCandidateId: (id: string) => void;

  // 질문/답변 관리
  addQA: (qa: QAItem) => void;
  addQAItem: (qa: QAItem) => void; // alias for addQA
  updateCurrentAnswer: (answer: string, audioUrl?: string) => void;
  nextQuestion: () => void;
  setTotalQuestions: (count: number) => void;

  // 면접 시간 설정
  setInterviewStartTime: (time: Date) => void;
  setInterviewEndTime: (time: Date) => void;

  // 면접 시작/종료
  startInterview: () => void;
  endInterview: () => void;

  // 결과 설정
  setResult: (result: InterviewResult) => void;

  // 초기화
  reset: () => void;
}

const initialState: InterviewState = {
  userInfo: null,
  status: "idle",
  qaHistory: [],
  currentQuestionIndex: 0,
  totalQuestions: 5,
  result: null,
  candidateId: null,
  interviewStartTime: null,
  interviewEndTime: null,
};

export const useInterviewStore = create<InterviewState & InterviewActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserInfo: (info) => set({ userInfo: info }),

      setStatus: (status) => set({ status }),

      setCandidateId: (id) => set({ candidateId: id }),

      addQA: (qa) =>
        set((state) => ({
          qaHistory: [...state.qaHistory, qa],
        })),

      addQAItem: (qa) =>
        set((state) => ({
          qaHistory: [...state.qaHistory, qa],
        })),

      updateCurrentAnswer: (answer, audioUrl) =>
        set((state) => {
          const newHistory = [...state.qaHistory];
          const currentIndex = state.currentQuestionIndex;
          if (newHistory[currentIndex]) {
            newHistory[currentIndex] = {
              ...newHistory[currentIndex],
              answer,
              audioUrl,
            };
          }
          return { qaHistory: newHistory };
        }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      setTotalQuestions: (count) => set({ totalQuestions: count }),

      setInterviewStartTime: (time) => set({ interviewStartTime: time }),

      setInterviewEndTime: (time) => set({ interviewEndTime: time }),

      startInterview: () =>
        set({
          status: "interviewing",
          interviewStartTime: new Date(),
          currentQuestionIndex: 0,
          qaHistory: [],
        }),

      endInterview: () =>
        set({
          status: "analyzing",
          interviewEndTime: new Date(),
        }),

      setResult: (result) =>
        set({
          result,
          status: "completed",
        }),

      reset: () => set(initialState),
    }),
    {
      name: "interview-storage",
      partialize: (state) => ({
        userInfo: state.userInfo,
        candidateId: state.candidateId,
        qaHistory: state.qaHistory,
        result: state.result,
      }),
    }
  )
);
