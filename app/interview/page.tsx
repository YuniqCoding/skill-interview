'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { WaveAnimation } from '@/components/WaveAnimation';
import { RecordButton } from '@/components/RecordButton';
import { useInterviewStore } from '@/stores/interviewStore';
import { JOB_POSITION_LABELS } from '@/types';

type InterviewPhase = 
  | 'loading'      // 면접 시작 중
  | 'ai-speaking'  // AI가 질문 읽는 중
  | 'user-ready'   // 사용자 답변 대기
  | 'user-recording' // 사용자 녹음 중
  | 'processing'   // 답변 처리 중
  | 'completed';   // 면접 완료

const TOTAL_QUESTIONS = 5;

export default function InterviewPage() {
  const router = useRouter();
  const { 
    userInfo, 
    candidateId,
    qaHistory,
    interviewStartTime,
    setStatus, 
    addQAItem, 
    setInterviewStartTime,
    setInterviewEndTime,
    setResult,
    startInterview: resetForNewInterview,
  } = useInterviewStore();

  // 상태
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [displayedText, setDisplayedText] = useState(''); // 타이핑 효과용
  const [questionNumber, setQuestionNumber] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 오디오 레벨 분석
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(Math.min(average / 128, 1));
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  // Assistant로 면접 시작
  const startInterview = async () => {
    if (!userInfo) return;

    try {
      setPhase('loading');
      setError(null);
      
      // 새 면접 시작 시 이전 기록 초기화
      resetForNewInterview();

      const response = await fetch('/api/assistant/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosition: userInfo.jobPosition,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setThreadId(result.data.threadId);
        setCurrentQuestion(result.data.question);
        setQuestionNumber(result.data.questionNumber);
        setInterviewStartTime(new Date());
        
        // 첫 질문 읽기
        await speakQuestion(result.data.question);
      } else {
        throw new Error(result.error || '면접 시작 실패');
      }
    } catch (err) {
      console.error('Start interview error:', err);
      setError('면접을 시작하는 중 오류가 발생했습니다.');
      setPhase('loading');
    }
  };

  // 타이핑 효과 시작 (오디오 길이에 맞춰 속도 조절)
  const startTypingEffect = (text: string, audioDuration?: number) => {
    // 이전 타이핑 인터벌 정리
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setDisplayedText('');
    const words = text.split(' ');
    let currentIndex = 0;
    
    // 오디오 길이가 있으면 그에 맞춰 속도 계산, 없으면 기본값 사용
    // 오디오보다 약간 빨리 끝나도록 90% 시간 사용
    const totalTime = audioDuration ? audioDuration * 1000 * 0.9 : words.length * 300;
    const intervalTime = Math.max(totalTime / words.length, 100); // 최소 100ms
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(words.slice(0, currentIndex + 1).join(' '));
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, intervalTime);
  };
  
  // 타이핑 효과 완료 (남은 텍스트 모두 표시)
  const completeTypingEffect = (text: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setDisplayedText(text);
  };

  // TTS로 질문 읽기
  const speakQuestion = async (question: string) => {
    try {
      setPhase('ai-speaking');
      setDisplayedText(''); // 초기화

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question }),
      });

      const result = await response.json();

      if (result.success && result.data.audio) {
        const audioBlob = base64ToBlob(result.data.audio, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // 오디오 재생 시작할 때 타이핑 시작
        audio.onplay = () => {
          // duration이 유효하면 사용, 아니면 undefined 전달
          const duration = audio.duration && isFinite(audio.duration) ? audio.duration : undefined;
          startTypingEffect(question, duration);
        };

        audio.onended = () => {
          // 오디오 끝나면 남은 텍스트 모두 표시
          completeTypingEffect(question);
          setPhase('user-ready');
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          completeTypingEffect(question);
          setPhase('user-ready');
        };

        await audio.play();
      } else {
        // TTS 실패 시 타이핑 없이 바로 표시
        setDisplayedText(question);
        setPhase('user-ready');
      }
    } catch (err) {
      console.error('TTS error:', err);
      setDisplayedText(question);
      setPhase('user-ready');
    }
  };

  // Base64를 Blob으로 변환
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAnswer(audioBlob);
      };

      mediaRecorder.start();
      setPhase('user-recording');
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      analyzeAudio();
    } catch (err) {
      console.error('Recording start error:', err);
      setError('녹음을 시작할 수 없습니다.');
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setPhase('processing');
  };

  // 답변 처리 (STT → Assistant)
  const processAnswer = async (audioBlob: Blob) => {
    try {
      // 1. STT로 텍스트 변환
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const sttResult = await sttResponse.json();
      let answerText = '(음성 인식 실패)';

      if (sttResult.success && sttResult.data.text) {
        answerText = sttResult.data.text;
      }

      // QA 기록 저장
      addQAItem({
        question: currentQuestion,
        answer: answerText,
      });

      // 2. Assistant에게 답변 전송
      if (!threadId) {
        throw new Error('Thread ID가 없습니다.');
      }

      const assistantResponse = await fetch('/api/assistant/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          answer: answerText,
          questionNumber,
        }),
      });

      const assistantResult = await assistantResponse.json();

      if (assistantResult.success && assistantResult.data) {
        if (assistantResult.data.isCompleted) {
          // 면접 완료
          setInterviewEndTime(new Date());
          setPhase('completed');
        } else {
          // 다음 질문
          setCurrentQuestion(assistantResult.data.response);
          setQuestionNumber(assistantResult.data.questionNumber);
          await speakQuestion(assistantResult.data.response);
        }
      } else {
        throw new Error(assistantResult.error || 'Assistant 응답 실패');
      }
    } catch (err) {
      console.error('Process answer error:', err);
      
      // 오류 발생 시에도 다음으로 진행
      if (questionNumber >= TOTAL_QUESTIONS) {
        setInterviewEndTime(new Date());
        setPhase('completed');
      } else {
        setError('답변 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        setPhase('user-ready');
      }
    }
  };

  // 면접 데이터 저장 및 종료
  const saveAndFinish = async () => {
    if (!userInfo) return;

    setIsSaving(true);
    setError(null);

    try {
      // 면접 소요 시간 계산 (초)
      const duration = interviewStartTime
        ? Math.floor((new Date().getTime() - new Date(interviewStartTime).getTime()) / 1000)
        : 0;

      // 웹훅으로 면접 데이터 전송
      const response = await fetch('/api/save-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidateId || `temp-${Date.now()}`,
          jobPosition: userInfo.jobPosition,
          phone: userInfo.phone,
          email: userInfo.email,
          questions: qaHistory.map((qa) => qa.question),
          answers: qaHistory.map((qa) => qa.answer),
          duration,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        console.log('Interview saved:', result.data);

        // 분석 결과가 있으면 스토어에 저장
        if (result.data?.analysis) {
          setResult(result.data.analysis);
          console.log('Analysis result saved:', result.data.analysis);
        }
      } else {
        throw new Error(result.error || '저장 실패');
      }
    } catch (err) {
      console.error('Save interview error:', err);
      setError('면접 데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 결과 페이지로 이동
  const goToResult = () => {
    setStatus('analyzing');
    router.push('/result');
  };

  // 컴포넌트 마운트 시
  useEffect(() => {
    if (!userInfo) {
      router.push('/');
      return;
    }

    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    startInterview();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      {/* 저장 중 로딩 오버레이 */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              {/* 로딩 아이콘 */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">면접 결과 분석 중</h3>
              <p className="text-slate-400 mb-6">
                AI가 면접 내용을 분석하고 있습니다.<br />
                잠시만 기다려주세요.
              </p>

              {/* 진행 단계 표시 */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className="flex items-center gap-3 text-left"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  <span className="text-slate-300 text-sm">면접 데이터 수집 완료</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 text-left"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                  <span className="text-slate-300 text-sm">답변 분석 진행 중...</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.5, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 text-left"
                >
                  <div className="w-2 h-2 bg-slate-600 rounded-full" />
                  <span className="text-slate-500 text-sm">피드백 및 점수 생성 대기</span>
                </motion.div>
              </div>

              {/* 프로그레스 바 */}
              <div className="mt-6">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 bg-[length:200%_100%]"
                    animate={{ 
                      backgroundPosition: ['0% 0%', '200% 0%'],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
            <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">
              {JOB_POSITION_LABELS[userInfo.jobPosition]} 면접
            </span>
            <span className="text-indigo-400 font-medium">
              {questionNumber} / {TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((phase === 'completed' ? questionNumber : questionNumber - 1) / TOTAL_QUESTIONS) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* 메인 카드 */}
        <Card variant="default" padding="lg">
          <AnimatePresence mode="wait">
            {/* 로딩 상태 */}
            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-6"
                />
                <p className="text-slate-400">AI 면접관을 준비하고 있습니다...</p>
                {error && (
                  <div className="mt-4">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button variant="primary" onClick={startInterview}>
                      다시 시도
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI 질문 중 */}
            {phase === 'ai-speaking' && (
              <motion.div
                key="ai-speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <div className="flex justify-center mb-8">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-4xl">🤖</span>
                  </motion.div>
                </div>

                <div className="flex justify-center mb-6">
                  <WaveAnimation isActive={true} variant="speaking" className="h-8" />
                </div>

                <div className="text-center">
                  <p className="text-slate-500 text-sm mb-2">질문 {questionNumber}</p>
                  <p className="text-white text-lg leading-relaxed">
                    {displayedText}
                    {displayedText !== currentQuestion && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-5 bg-indigo-400 ml-1 align-middle"
                      />
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 사용자 답변 대기 / 녹음 중 */}
            {(phase === 'user-ready' || phase === 'user-recording') && (
              <motion.div
                key="user-turn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <div className="mb-8 p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-500 text-sm mb-2">질문 {questionNumber}</p>
                  <p className="text-white leading-relaxed">{currentQuestion}</p>
                </div>

                {phase === 'user-recording' && (
                  <div className="flex justify-center mb-6">
                    <WaveAnimation
                      isActive={true}
                      audioLevel={audioLevel}
                      variant="listening"
                      className="h-12"
                    />
                  </div>
                )}

                <div className="flex justify-center">
                  <RecordButton
                    isRecording={phase === 'user-recording'}
                    isDisabled={false}
                    onStart={startRecording}
                    onStop={stopRecording}
                    recordingTime={recordingTime}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-center mt-4 text-sm">{error}</p>
                )}
              </motion.div>
            )}

            {/* 답변 처리 중 */}
            {phase === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-slate-400">답변을 분석하고 있습니다...</p>
              </motion.div>
            )}

            {/* 면접 완료 */}
            {phase === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">면접이 완료되었습니다!</h2>
                <p className="text-slate-400 mb-6">
                  총 {TOTAL_QUESTIONS}개의 질문에 답변하셨습니다.
                </p>

                {/* 저장 성공 메시지 */}
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg"
                  >
                    <p className="text-emerald-400">
                      ✅ 면접 데이터가 성공적으로 저장되었습니다!
                    </p>
                  </motion.div>
                )}

                {/* 에러 메시지 */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400">{error}</p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-3">
                  {!saveSuccess ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={saveAndFinish}
                      disabled={isSaving}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    >
                      면접 종료
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={goToResult}
                      rightIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      }
                    >
                      결과 확인하기
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* 하단 안내 */}
        {(phase === 'user-ready' || phase === 'user-recording') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-slate-500 text-sm"
          >
            💡 또렷하게 말씀해주세요. 답변이 끝나면 버튼을 다시 눌러주세요.
          </motion.div>
        )}
      </div>
    </div>
  );
}
