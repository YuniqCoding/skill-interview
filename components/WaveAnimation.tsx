'use client';

import { motion } from 'framer-motion';

interface WaveAnimationProps {
  isActive: boolean;
  audioLevel?: number; // 0-1 범위
  variant?: 'default' | 'listening' | 'speaking';
  className?: string;
}

export function WaveAnimation({
  isActive,
  audioLevel = 0,
  variant = 'default',
  className = '',
}: WaveAnimationProps) {
  const barCount = 5;
  
  const getBarColor = () => {
    switch (variant) {
      case 'listening':
        return 'bg-emerald-500';
      case 'speaking':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'listening':
        return 'shadow-emerald-500/50';
      case 'speaking':
        return 'shadow-indigo-500/50';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => {
        // 각 바의 기본 높이 패턴
        const baseHeights = [0.4, 0.7, 1, 0.7, 0.4];
        const baseHeight = baseHeights[index];
        
        // 오디오 레벨에 따른 동적 높이
        const dynamicHeight = isActive 
          ? baseHeight * (0.3 + audioLevel * 0.7)
          : 0.2;

        return (
          <motion.div
            key={index}
            className={`w-1 rounded-full ${getBarColor()} ${isActive ? `shadow-lg ${getGlowColor()}` : ''}`}
            animate={{
              height: isActive 
                ? [
                    `${dynamicHeight * 24}px`,
                    `${dynamicHeight * 40}px`,
                    `${dynamicHeight * 24}px`,
                  ]
                : '8px',
              opacity: isActive ? 1 : 0.3,
            }}
            transition={{
              duration: 0.5,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.1,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

// 원형 음파 애니메이션 (마이크 테스트용)
export function CircularWaveAnimation({
  isActive,
  audioLevel = 0,
  className = '',
}: {
  isActive: boolean;
  audioLevel?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* 배경 원 */}
      <div className="absolute inset-0 rounded-full bg-slate-800/50" />
      
      {/* 음파 원들 */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
          initial={{ scale: 1, opacity: 0 }}
          animate={
            isActive
              ? {
                  scale: [1, 1.5 + index * 0.3 + audioLevel * 0.5],
                  opacity: [0.6, 0],
                }
              : { scale: 1, opacity: 0 }
          }
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            delay: index * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* 중앙 마이크 아이콘 영역 */}
      <motion.div
        className={`absolute inset-0 flex items-center justify-center rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
        }}
      >
        <svg
          className={`w-1/2 h-1/2 ${isActive ? 'text-white' : 'text-slate-400'}`}
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
      </motion.div>
    </div>
  );
}

export default WaveAnimation;


