'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Checkbox } from '@/components/ui';
import { useInterviewStore } from '@/stores/interviewStore';
import { JOB_POSITION_LABELS } from '@/types';

// 체크리스트 항목
const CHECKLIST_ITEMS = [
  {
    id: 'quiet-environment',
    label: '조용한 환경에서 진행해 주세요',
    icon: '🔇',
  },
  {
    id: 'mic-confirmed',
    label: '마이크가 정상 작동하는지 확인했습니다',
    icon: '🎤',
  },
  {
    id: 'time-notice',
    label: '예상 소요 시간: 10-15분',
    icon: '⏱️',
  },
  {
    id: 'record-instruction',
    label: 'AI가 질문을 마치면 녹음 버튼을 눌러 답변해 주세요',
    icon: '🔴',
  },
  {
    id: 'stop-instruction',
    label: '답변을 마치면 정지 버튼을 눌러주세요',
    icon: '⏹️',
  },
];

export default function PreparationPage() {
  const router = useRouter();
  const { userInfo, setStatus } = useInterviewStore();
  
  // 체크 상태 관리
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // 모든 항목이 체크되었는지 확인
  const allChecked = CHECKLIST_ITEMS.every((item) => checkedItems[item.id]);
  
  // 체크 토글
  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 면접 시작
  const startInterview = () => {
    setStatus('interviewing');
    router.push('/interview');
  };

  // 사용자 정보 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }
  }, [userInfo, router]);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-6"
          >
            <span className="text-4xl">📋</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            면접 준비
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400"
          >
            면접을 시작하기 전에 아래 사항을 확인해주세요
          </motion.p>
        </div>

        {/* 사용자 정보 표시 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">지원 직무</p>
              <p className="text-white font-medium">
                {JOB_POSITION_LABELS[userInfo.jobPosition]}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 체크리스트 카드 */}
        <Card variant="default" padding="lg">
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    checkedItems[item.id]
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="flex-shrink-0 pt-0.5 pointer-events-none">
                    <Checkbox
                      checked={checkedItems[item.id] || false}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`text-sm ${
                        checkedItems[item.id] ? 'text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  
                  {/* 체크 완료 아이콘 */}
                  {checkedItems[item.id] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex-shrink-0"
                    >
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 진행 상태 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 mb-4"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">준비 완료</span>
              <span className="text-indigo-400">
                {Object.values(checkedItems).filter(Boolean).length} / {CHECKLIST_ITEMS.length}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${(Object.values(checkedItems).filter(Boolean).length / CHECKLIST_ITEMS.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* 면접 시작 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              variant={allChecked ? 'primary' : 'secondary'}
              size="lg"
              className="w-full"
              disabled={!allChecked}
              onClick={startInterview}
              rightIcon={
                allChecked ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                ) : undefined
              }
            >
              {allChecked ? '면접 시작하기' : '모든 항목을 확인해주세요'}
            </Button>
          </motion.div>
        </Card>

        {/* 뒤로가기 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-4 text-center"
        >
          <button
            onClick={() => router.push('/voice-test')}
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            ← 음성 테스트로 돌아가기
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
