'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { CircularWaveAnimation, WaveAnimation } from '@/components/WaveAnimation';
import { useInterviewStore } from '@/stores/interviewStore';

type MicPermissionStatus = 'pending' | 'granted' | 'denied' | 'error';
type TestStatus = 'idle' | 'testing' | 'success' | 'failed';

export default function VoiceTestPage() {
  const router = useRouter();
  const { userInfo, setStatus } = useInterviewStore();
  
  // 상태 관리
  const [micPermission, setMicPermission] = useState<MicPermissionStatus>('pending');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [testMessage, setTestMessage] = useState('');
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  
  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const maxAudioLevelRef = useRef<number>(0); // 테스트 중 감지된 최대 오디오 레벨
  const voiceDetectedRef = useRef<boolean>(false); // 음성 감지 여부
  
  // 테스트 문구
  const TEST_PHRASE = '안녕하세요, 테스트입니다';

  // 오디오 레벨 분석
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // 평균 볼륨 계산
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1);
    
    setAudioLevel(normalizedLevel);
    
    // 최대 레벨 및 음성 감지 여부 업데이트
    if (normalizedLevel > maxAudioLevelRef.current) {
      maxAudioLevelRef.current = normalizedLevel;
    }
    if (normalizedLevel > 0.1) {
      voiceDetectedRef.current = true;
      setIsVoiceDetected(true);
    }
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  // 마이크 권한 요청
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // AudioContext 설정
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setMicPermission('granted');
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission('denied');
    }
  };

  // 음성 테스트 시작
  const startTest = () => {
    // 테스트 시작 전 초기화
    maxAudioLevelRef.current = 0;
    voiceDetectedRef.current = false;
    setIsVoiceDetected(false);
    
    setTestStatus('testing');
    setTestMessage('');
    
    // 오디오 분석 시작
    analyzeAudio();
  };

  // 테스트 종료 (사용자가 버튼 클릭)
  const finishTest = () => {
    // 오디오 분석 중지
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // useRef 값을 사용하여 음성 감지 여부 확인
    const wasVoiceDetected = voiceDetectedRef.current;
    const maxLevel = maxAudioLevelRef.current;
    
    console.log('Voice test result:', { wasVoiceDetected, maxLevel });
    
    if (wasVoiceDetected || maxLevel > 0.1) {
      setTestStatus('success');
      setTestMessage('음성이 정상적으로 감지되었습니다!');
    } else {
      setTestStatus('failed');
      setTestMessage('음성이 감지되지 않았습니다. 다시 시도해주세요.');
    }
  };

  // 테스트 재시도
  const retryTest = () => {
    setTestStatus('idle');
    setAudioLevel(0);
    setTestMessage('');
    setIsVoiceDetected(false);
    maxAudioLevelRef.current = 0;
    voiceDetectedRef.current = false;
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    setStatus('preparation');
    router.push('/preparation');
  };

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    // 사용자 정보가 없으면 홈으로 리다이렉트
    if (!userInfo) {
      router.push('/');
      return;
    }
    
    requestMicPermission();
    
    // 클린업
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [userInfo, router]);

  // 권한 거부 화면
  if (micPermission === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card variant="default" padding="lg" className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">마이크 권한이 필요합니다</h2>
            <p className="text-slate-400 mb-6">
              AI 면접을 진행하려면 마이크 접근 권한이 필요합니다.<br />
              브라우저 설정에서 마이크 권한을 허용해주세요.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={requestMicPermission}
              >
                다시 시도
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/')}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 권한 요청 중 화면
  if (micPermission === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">마이크 권한을 확인하고 있습니다...</p>
        </motion.div>
      </div>
    );
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
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            음성 테스트
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            마이크가 정상적으로 작동하는지 확인합니다
          </motion.p>
        </div>

        <Card variant="default" padding="lg">
          <div className="space-y-8">
            {/* 마이크 상태 표시 */}
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">마이크 연결됨</span>
            </div>

            {/* 음파 애니메이션 */}
            <div className="flex justify-center">
              <CircularWaveAnimation
                isActive={testStatus === 'testing'}
                audioLevel={audioLevel}
                className="w-32 h-32"
              />
            </div>

            {/* 테스트 상태 */}
            <AnimatePresence mode="wait">
              {testStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <p className="text-slate-300">
                    아래 버튼을 누르고 다음 문장을 말씀해주세요:
                  </p>
                  <p className="text-xl font-semibold text-indigo-400">
                    &ldquo;{TEST_PHRASE}&rdquo;
                  </p>
                </motion.div>
              )}

              {testStatus === 'testing' && (
                <motion.div
                  key="testing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <p className="text-slate-300">지금 말씀해주세요:</p>
                  <p className="text-xl font-semibold text-emerald-400">
                    &ldquo;{TEST_PHRASE}&rdquo;
                  </p>
                  
                  {/* 음파 막대 */}
                  <div className="flex justify-center py-4">
                    <WaveAnimation
                      isActive={true}
                      audioLevel={audioLevel}
                      variant="listening"
                      className="h-12"
                    />
                  </div>
                  
                  {/* 음성 감지 상태 표시 */}
                  <p className={`text-sm ${isVoiceDetected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isVoiceDetected ? '✓ 음성이 감지되었습니다' : '마이크에 대고 말씀해주세요'}
                  </p>
                </motion.div>
              )}

              {testStatus === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-emerald-400 font-medium">{testMessage}</p>
                </motion.div>
              )}

              {testStatus === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </motion.div>
                  <p className="text-amber-400 font-medium">{testMessage}</p>
                  <p className="text-slate-500 text-sm">
                    마이크가 올바르게 연결되어 있는지 확인해주세요.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 버튼 영역 */}
            <div className="space-y-3">
              {testStatus === 'idle' && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={startTest}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  }
                >
                  테스트 시작
                </Button>
              )}

              {testStatus === 'testing' && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={finishTest}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                >
                  테스트 완료
                </Button>
              )}

              {testStatus === 'success' && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={goToNextStep}
                  rightIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  다음 단계로
                </Button>
              )}

              {testStatus === 'failed' && (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={retryTest}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    다시 테스트
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full text-slate-400"
                    onClick={goToNextStep}
                  >
                    그래도 계속 진행
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* 안내 문구 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
        >
          <h3 className="text-sm font-medium text-slate-300 mb-2">💡 테스트 팁</h3>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• 조용한 환경에서 테스트해주세요</li>
            <li>• 마이크와 적당한 거리(20-30cm)를 유지해주세요</li>
            <li>• 말을 또렷하게 해주세요</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
