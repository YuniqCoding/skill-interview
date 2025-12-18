import { NextRequest, NextResponse } from 'next/server';
import { saveInterviewToMake } from '@/lib/make';
import type { SaveInterviewRequest } from '@/types';

// 🧪 Mock 응답 (Make 웹훅 응답 시뮬레이션)
const MOCK_WEBHOOK_RESPONSE = {
  success: true,
  message: '면접 분석이 완료되었습니다!',
  interviewId: 'mock-interview-123',
  interview_summary: '면접자는 프론트엔드 개발 직무에 지원하였으며, React와 TypeScript에 대한 실무 경험을 강조했습니다. 협업 도구로는 Figma와 Notion을 사용하며, 최근 AI 기술을 프로젝트에 적용한 경험을 공유했습니다.',
  model_answers: JSON.stringify({
    '자기소개': '안녕하세요, 저는 3년차 프론트엔드 개발자입니다. React와 TypeScript를 주력으로 사용하며, 사용자 경험을 중시하는 개발을 추구합니다.',
    '도전적 프로젝트': 'AI 면접 시스템 개발이 가장 도전적이었습니다. OpenAI API 연동과 실시간 음성 처리를 구현하면서 새로운 기술을 많이 배웠습니다.',
    '협업 도구': 'Figma와 Notion을 주로 사용합니다. Figma로 디자이너와 협업하고, Notion으로 문서화와 일정 관리를 합니다.',
  }),
  interview_feedback: JSON.stringify({
    strengths: '기술적 역량이 뛰어나고 최신 트렌드에 민감합니다. 문제 해결 능력과 학습 의지가 돋보입니다.',
    areas_for_improvement: '답변 구조화가 필요합니다. STAR 기법을 활용하면 더 설득력 있는 답변이 가능합니다.',
  }),
  interview_score: {
    total: 78,
    details: {
      understanding: 20,
      logic: 18,
      practical_fit: 22,
      communication: 18,
    },
    reason: '기술적 이해도와 실무 적합성이 높으나, 논리적 표현력과 커뮤니케이션 구조화가 필요합니다.',
  },
  candidate_analysis: JSON.stringify({
    type: '기술 중심형',
    strengths: '최신 기술 습득이 빠르고 실무 적용 능력이 뛰어남',
    cautions: '커뮤니케이션 구조화 필요, STAR 기법 연습 권장',
  }),
};

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const useMock = url.searchParams.get('mock') === 'true';
    
    const body: SaveInterviewRequest = await request.json();

    // 유효성 검사
    if (!body.candidateId || !body.questions || !body.answers) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 🧪 Mock 모드: Make 호출 없이 바로 mock 응답 반환
    if (useMock) {
      console.log('🧪 Using mock response (Make not called)');
      
      const mockAnalysis = {
        interview_summary: MOCK_WEBHOOK_RESPONSE.interview_summary,
        model_answers: MOCK_WEBHOOK_RESPONSE.model_answers,
        interview_feedback: MOCK_WEBHOOK_RESPONSE.interview_feedback,
        interview_score: MOCK_WEBHOOK_RESPONSE.interview_score,
        candidate_analysis: MOCK_WEBHOOK_RESPONSE.candidate_analysis,
      };

      return NextResponse.json({
        success: true,
        data: {
          interviewId: MOCK_WEBHOOK_RESPONSE.interviewId,
          message: MOCK_WEBHOOK_RESPONSE.message,
          analysis: mockAnalysis,
        },
      });
    }

    // 실제 Make 웹훅으로 데이터 전송
    const result = await saveInterviewToMake(body);
    
    console.log('saveInterviewToMake result:', JSON.stringify(result, null, 2));
    console.log('Analysis data:', result.data?.analysis);

    if (result.success) {
      const responseData = {
        interviewId: result.data?.interviewId,
        message: result.data?.message || '면접 데이터가 저장되었습니다!',
        analysis: result.data?.analysis,
      };
      console.log('Sending response:', JSON.stringify(responseData, null, 2));
      
      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Save interview error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

