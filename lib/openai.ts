import OpenAI from 'openai';

// OpenAI 클라이언트 인스턴스 (서버 사이드에서만 사용)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID
export const INTERVIEW_ASSISTANT_ID = 'asst_t8ZiLEOcyAZUksttIdAb2Uky';

// 직무별 기술 면접 질문 생성 프롬프트
export function getInterviewPrompt(jobPosition: string, questionCount: number = 5): string {
  const jobDescriptions: Record<string, string> = {
    frontend: '프론트엔드 개발자 (React, TypeScript, CSS, 웹 성능 최적화, 상태 관리)',
    backend: '백엔드 개발자 (Node.js, Python, 데이터베이스, API 설계, 시스템 아키텍처)',
    fullstack: '풀스택 개발자 (프론트엔드, 백엔드, 데이터베이스, DevOps 기초)',
    'data-engineer': '데이터 엔지니어 (ETL, 데이터 파이프라인, SQL, 빅데이터 처리)',
    devops: 'DevOps 엔지니어 (CI/CD, 컨테이너, 클라우드, 인프라 자동화)',
    'ai-ml': 'AI/ML 엔지니어 (머신러닝, 딥러닝, 모델 학습, 데이터 전처리)',
    tpm: 'Technical Project Manager (프로젝트 관리, 애자일/스크럼, 기술 리더십, 이해관계자 관리, 리스크 관리)',
  };

  const jobDesc = jobDescriptions[jobPosition] || jobPosition;

  return `당신은 ${jobDesc} 포지션의 기술 면접관입니다.
  
다음 조건에 맞는 기술 면접 질문 ${questionCount}개를 생성해주세요:

1. 난이도: 중급에서 고급 수준
2. 실무 경험을 확인할 수 있는 질문
3. 문제 해결 능력을 평가할 수 있는 질문
4. 각 질문은 독립적이어야 함
5. 질문은 한국어로 작성

JSON 형식으로 응답해주세요:
{
  "questions": [
    "질문 1",
    "질문 2",
    ...
  ]
}`;
}

// 면접 답변 분석 프롬프트
export function getAnalysisPrompt(
  jobPosition: string,
  qaHistory: Array<{ question: string; answer: string }>
): string {
  const qaText = qaHistory
    .map((qa, i) => `질문 ${i + 1}: ${qa.question}\n답변 ${i + 1}: ${qa.answer}`)
    .join('\n\n');

  return `당신은 ${jobPosition} 포지션의 기술 면접 평가자입니다.

다음 면접 질문과 답변을 분석하고 평가해주세요:

${qaText}

다음 항목을 기준으로 100점 만점으로 평가하고, 상세 피드백을 제공해주세요:
1. 기술적 정확성 (0-100)
2. 커뮤니케이션 능력 (0-100)
3. 문제 해결 능력 (0-100)
4. 직무 적합성 (0-100)

JSON 형식으로 응답해주세요:
{
  "score": 총점 (0-100, 위 4개 항목의 가중 평균),
  "detailedAnalysis": {
    "technicalAccuracy": 점수,
    "communicationSkills": 점수,
    "problemSolving": 점수,
    "jobFit": 점수
  },
  "feedback": {
    "strengths": ["강점 1", "강점 2", ...],
    "improvements": ["개선점 1", "개선점 2", ...],
    "recommendations": ["추천 학습 자료 1", "추천 학습 자료 2", ...]
  }
}`;
}

// 점수에 따른 등급 계산
export function calculateGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

