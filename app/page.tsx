'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input, Select, Card } from '@/components/ui';
import { useInterviewStore } from '@/stores/interviewStore';
import { JOB_POSITION_LABELS, type JobPosition } from '@/types';

// 직무 옵션
const jobOptions = Object.entries(JOB_POSITION_LABELS).map(([value, label]) => ({
  value,
  label,
  icon: getJobIcon(value as JobPosition),
}));

function getJobIcon(job: JobPosition): React.ReactNode {
  const icons: Record<JobPosition, React.ReactNode> = {
    frontend: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    backend: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    fullstack: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'data-engineer': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    devops: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    'ai-ml': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tpm: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    'service-planner': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  };
  return icons[job];
}

export default function HomePage() {
  const router = useRouter();
  const { setUserInfo, setStatus, setCandidateId } = useInterviewStore();
  
  const [formData, setFormData] = useState({
    jobPosition: '' as JobPosition | '',
    phone: '',
    email: '',
  });
  
  const [errors, setErrors] = useState({
    jobPosition: '',
    phone: '',
    email: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 전화번호 유효성 검사
  const validatePhone = (phone: string) => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {
      jobPosition: '',
      phone: '',
      email: '',
    };

    if (!formData.jobPosition) {
      newErrors.jobPosition = '직무를 선택해주세요';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // API 호출하여 사용자 정보 저장
      const response = await fetch('/api/submit-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 스토어에 사용자 정보 저장
        setUserInfo({
          jobPosition: formData.jobPosition as JobPosition,
          phone: formData.phone,
          email: formData.email,
        });
        setCandidateId(result.data.candidateId);
        setStatus('voice-test');
        
        // 등록 확인 메시지 표시
        const message = result.data.message || '등록이 완료되었습니다!';
        setSuccessMessage(message);
        
        // 2초 후 음성 테스트 페이지로 이동
        setTimeout(() => {
          router.push('/voice-test');
        }, 2000);
      } else {
        alert('정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      {/* 성공 메시지 토스트 */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl backdrop-blur-sm shadow-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-emerald-100 font-medium">{successMessage}</span>
          </div>
        </motion.div>
      )}

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
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 mb-6"
          >
            <svg
              className="w-10 h-10 text-white"
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
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            AI 기술 인터뷰
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400"
          >
            AI와 함께하는 실전 기술 면접을 경험해보세요
          </motion.p>
        </div>

        {/* Form Card */}
        <Card variant="default" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 직무 선택 */}
            <Select
              label="지원 직무"
              options={jobOptions}
              value={formData.jobPosition}
              onChange={(value) =>
                setFormData({ ...formData, jobPosition: value as JobPosition })
              }
              placeholder="직무를 선택해주세요"
              error={errors.jobPosition}
            />

            {/* 전화번호 */}
            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              error={errors.phone}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              }
            />

            {/* 이메일 */}
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              }
            >
              면접 시작하기
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          * 입력된 정보는 면접 진행 및 결과 분석에만 사용됩니다
        </motion.p>
      </motion.div>
    </div>
  );
}
