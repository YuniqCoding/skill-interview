// 사용자 정보 타입
export interface UserInfo {
  jobPosition: JobPosition;
  phone: string;
  email: string;
}

// 직무 타입
export type JobPosition =
  | "frontend"
  | "backend"
  | "fullstack"
  | "data-engineer"
  | "devops"
  | "ai-ml"
  | "tpm"
  | "service-planner";

// 직무 라벨 매핑
export const JOB_POSITION_LABELS: Record<JobPosition, string> = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자",
  fullstack: "풀스택 개발자",
  "data-engineer": "데이터 엔지니어",
  devops: "DevOps 엔지니어",
  "ai-ml": "AI/ML 엔지니어",
  tpm: "Technical Project Manager",
  "service-planner": "서비스 기획자",
};

// 면접 질문/답변 타입
export interface QAItem {
  question: string;
  answer: string;
  audioUrl?: string;
}

// 면접 결과 타입 (Make GPT 모듈 응답)
export interface InterviewResult {
  interview_summary: string;
  model_answers: string;
  interview_feedback: string;
  interview_score: {
    total: number;
    details: {
      understanding: number;
      logic: number;
      practical_fit: number;
      communication: number;
    };
    reason: string;
  };
  candidate_analysis: string;
}

// 등급 계산 헬퍼
export function getGradeFromScore(score: number): "S" | "A" | "B" | "C" | "D" {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

// 등급별 색상
export const GRADE_COLORS: Record<"S" | "A" | "B" | "C" | "D", string> = {
  S: "text-amber-400",
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-orange-400",
  D: "text-red-400",
};

// 등급별 배경색
export const GRADE_BG_COLORS: Record<"S" | "A" | "B" | "C" | "D", string> = {
  S: "bg-amber-500/20 border-amber-500/30",
  A: "bg-emerald-500/20 border-emerald-500/30",
  B: "bg-blue-500/20 border-blue-500/30",
  C: "bg-orange-500/20 border-orange-500/30",
  D: "bg-red-500/20 border-red-500/30",
};

// 면접 상태 타입
export type InterviewStatus =
  | "idle"
  | "info-input"
  | "voice-test"
  | "preparation"
  | "interviewing"
  | "analyzing"
  | "completed";

// 면접 스토어 상태 타입
export interface InterviewState {
  // 사용자 정보
  userInfo: UserInfo | null;

  // 면접 상태
  status: InterviewStatus;

  // 질문/답변 기록
  qaHistory: QAItem[];
  currentQuestionIndex: number;
  totalQuestions: number;

  // 결과
  result: InterviewResult | null;

  // 세션 정보
  candidateId: string | null;
  interviewStartTime: Date | null;
  interviewEndTime: Date | null;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Make 웹훅 요청 타입
export interface SubmitInfoRequest {
  jobPosition: JobPosition;
  phone: string;
  email: string;
}

export interface SaveInterviewRequest {
  candidateId: string;
  jobPosition: JobPosition;
  phone: string;
  email: string;
  questions: string[];
  answers: string[];
  duration: number;
}

// Make 웹훅 응답 타입
export interface MakeWebhookResponse {
  success: boolean;
  message?: string;
  candidateId?: string;
  id?: string;
}
