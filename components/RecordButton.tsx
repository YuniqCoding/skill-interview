'use client';

import { motion } from 'framer-motion';

interface RecordButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onStart: () => void;
  onStop: () => void;
  recordingTime?: number; // 초 단위
  className?: string;
}

export function RecordButton({
  isRecording,
  isDisabled,
  onStart,
  onStop,
  recordingTime = 0,
  className = '',
}: RecordButtonProps) {
  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 녹음 버튼 */}
      <motion.button
        type="button"
        disabled={isDisabled}
        onClick={isRecording ? onStop : onStart}
        className={`
          relative w-20 h-20 rounded-full
          flex items-center justify-center
          transition-all duration-300
          ${
            isDisabled
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
          }
        `}
        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
        animate={
          isRecording
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(239, 68, 68, 0.4)',
                  '0 0 0 20px rgba(239, 68, 68, 0)',
                ],
              }
            : undefined
        }
        transition={
          isRecording
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }
            : undefined
        }
      >
        {/* 아이콘 */}
        {isRecording ? (
          // 정지 아이콘 (사각형)
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-7 h-7 bg-white rounded-sm"
          />
        ) : (
          // 마이크 아이콘
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </motion.button>

      {/* 상태 텍스트 */}
      <div className="text-center">
        {isRecording ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-red-400 font-medium flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              녹음 중
            </span>
            <span className="text-2xl font-mono text-white">
              {formatTime(recordingTime)}
            </span>
          </motion.div>
        ) : isDisabled ? (
          <span className="text-slate-500 text-sm">AI가 말하는 중...</span>
        ) : (
          <span className="text-slate-400 text-sm">버튼을 눌러 답변하세요</span>
        )}
      </div>
    </div>
  );
}

export default RecordButton;


