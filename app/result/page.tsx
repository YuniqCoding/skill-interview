'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { useInterviewStore } from '@/stores/interviewStore';
import { getGradeFromScore, GRADE_COLORS, GRADE_BG_COLORS, JOB_POSITION_LABELS } from '@/types';

// 세부 점수 라벨
const SCORE_LABELS = {
  understanding: '이해력',
  logic: '논리력',
  practical_fit: '실무 적합성',
  communication: '커뮤니케이션',
};

// 객체/문자열을 렌더링 가능한 문자열로 변환
function formatContent(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') {
    // JSON 문자열인 경우 파싱 시도
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object') {
        return formatObject(parsed);
      }
      return content;
    } catch {
      return content;
    }
  }
  if (typeof content === 'object') {
    return formatObject(content as Record<string, unknown>);
  }
  return String(content);
}

// 객체를 보기 좋은 문자열로 변환
function formatObject(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      const label = key.replace(/_/g, ' ');
      if (typeof value === 'object' && value !== null) {
        return `【${label}】\n${formatObject(value as Record<string, unknown>)}`;
      }
      return `【${label}】\n${value}`;
    })
    .join('\n\n');
}

// 모범 답안 포맷 (q1, q2 등을 실제 질문으로 매핑)
function formatModelAnswers(
  modelAnswers: unknown,
  qaHistory: { question: string; answer: string }[]
): React.ReactNode {
  if (!modelAnswers) {
    return <p className="text-slate-400">모범 답안 정보가 없습니다.</p>;
  }

  // 문자열인 경우 JSON 파싱 시도
  let answers: Record<string, string> = {};
  if (typeof modelAnswers === 'string') {
    try {
      answers = JSON.parse(modelAnswers);
    } catch {
      // 파싱 실패 시 그대로 표시
      return <p className="text-slate-300 whitespace-pre-line">{modelAnswers}</p>;
    }
  } else if (typeof modelAnswers === 'object') {
    answers = modelAnswers as Record<string, string>;
  }

  // q1, q2, q3... 형태인 경우 qaHistory와 매핑
  const entries = Object.entries(answers);
  
  return entries.map(([key, value], index) => {
    // q1, q2 등의 키에서 인덱스 추출
    const qMatch = key.match(/^q(\d+)$/);
    let questionText = key;
    
    if (qMatch) {
      const qIndex = parseInt(qMatch[1]) - 1; // q1 -> index 0
      if (qaHistory[qIndex]) {
        questionText = qaHistory[qIndex].question;
      } else {
        questionText = `질문 ${qMatch[1]}`;
      }
    }

    return (
      <div key={key} className="border-l-2 border-emerald-500 pl-4">
        <p className="text-emerald-400 font-medium mb-2">
          Q{index + 1}. {questionText}
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          {String(value)}
        </p>
      </div>
    );
  });
}

// 원형 게이지 컴포넌트
function CircularGauge({ score, size = 200 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const grade = getGradeFromScore(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 100 100">
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-800"
        />
        {/* 진행 원 */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      {/* 점수 표시 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedScore}
        </motion.span>
        <motion.span
          className={`text-2xl font-bold ${GRADE_COLORS[grade]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {grade}등급
        </motion.span>
      </div>
    </div>
  );
}

// 세부 점수 바 컴포넌트 (각 항목 25점 만점)
function ScoreBar({ label, score, maxScore = 25, delay = 0 }: { label: string; score: number; maxScore?: number; delay?: number }) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{score}점</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.5, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { userInfo, result, qaHistory, reset } = useInterviewStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'feedback' | 'answers'>('summary');

  // 결과가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!result) {
      // 개발 중에는 주석 처리
      // router.push('/');
    }
  }, [result, router]);

  // 새 면접 시작
  const startNewInterview = () => {
    reset();
    router.push('/');
  };

  // 결과가 없는 경우 (개발용 임시 화면)
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card variant="default" padding="lg" className="max-w-md w-full text-center">
          <div className="py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-slate-400">분석 결과를 기다리는 중...</p>
            <p className="text-slate-500 text-sm mt-2">
              면접 종료 후 결과가 표시됩니다.
            </p>
            <Button variant="ghost" className="mt-6" onClick={() => router.push('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 세부 점수 합계 계산 (각 25점 만점 × 4 = 100점 만점)
  const detailScores = Object.values(result.interview_score.details);
  const calculatedTotal = detailScores.reduce((sum, score) => sum + score, 0);
  const grade = getGradeFromScore(calculatedTotal);

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">면접 결과</h1>
          {userInfo && (
            <p className="text-slate-400">
              {JOB_POSITION_LABELS[userInfo.jobPosition]} 면접
            </p>
          )}
        </motion.div>

        {/* 점수 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="default" padding="lg" className="mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 원형 게이지 */}
              <div className="flex-shrink-0">
                <CircularGauge score={calculatedTotal} />
              </div>

              {/* 세부 점수 */}
              <div className="flex-1 w-full space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">세부 점수 <span className="text-slate-500 text-sm font-normal">(각 25점 만점)</span></h3>
                {Object.entries(result.interview_score.details).map(([key, value], index) => (
                  <ScoreBar
                    key={key}
                    label={SCORE_LABELS[key as keyof typeof SCORE_LABELS]}
                    score={value}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            </div>

            {/* 등급 배지 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className={`mt-6 p-4 rounded-lg border ${GRADE_BG_COLORS[grade]} text-center`}
            >
              <p className="text-slate-300 text-sm">
                {result.interview_score.reason}
              </p>
            </motion.div>
          </Card>
        </motion.div>

        {/* 탭 네비게이션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 mb-4"
        >
          {[
            { id: 'summary', label: '면접 요약' },
            { id: 'feedback', label: '피드백' },
            { id: 'answers', label: '모범 답안' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* 탭 컨텐츠 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="default" padding="lg">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    📋 면접 요약
                  </h3>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {result.interview_summary || '요약 정보가 없습니다.'}
                  </p>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    🎯 지원자 분석
                  </h3>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {formatContent(result.candidate_analysis) || '분석 정보가 없습니다.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  💬 상세 피드백
                </h3>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {formatContent(result.interview_feedback) || '피드백 정보가 없습니다.'}
                </p>
              </div>
            )}

            {activeTab === 'answers' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  ✨ 모범 답안
                </h3>
                <div className="space-y-4">
                  {formatModelAnswers(result.model_answers, qaHistory)}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* 질문/답변 히스토리 */}
        {qaHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card variant="default" padding="lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📝 면접 기록
              </h3>
              <div className="space-y-4">
                {qaHistory.map((qa, index) => (
                  <div key={index} className="border-l-2 border-indigo-500 pl-4">
                    <p className="text-indigo-400 font-medium mb-1">
                      Q{index + 1}. {qa.question}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {qa.answer || '(답변 없음)'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 하단 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={startNewInterview}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            새 면접 시작하기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
