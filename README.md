# AI 기술 면접 시뮬레이터

AI 면접관과 실제 면접처럼 대화하며 기술 면접을 연습할 수 있는 웹 애플리케이션입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green?logo=openai)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

## 주요 기능

### 🎤 AI 면접관

- OpenAI Assistant API를 활용한 맞춤형 기술 면접
- 실시간 음성 인식(STT) 및 음성 합성(TTS)
- 직무별 맞춤 질문 생성 (프론트엔드, 백엔드, 풀스택, DevOps, AI/ML, TPM 등)

### 📊 면접 결과 분석

- 100점 만점 종합 점수
- 세부 평가 항목 (이해력, 논리력, 실무 적합성, 커뮤니케이션)
- AI 기반 피드백 및 모범 답안 제공
- 면접자 성향 분석

### 🔗 외부 서비스 연동

- Make (Integromat) 웹훅을 통한 데이터 자동화
- Airtable 연동으로 면접 데이터 저장

## 기술 스택

| 분류           | 기술                             |
| -------------- | -------------------------------- |
| **Frontend**   | Next.js 16, React 19, TypeScript |
| **Styling**    | Tailwind CSS 4, Framer Motion    |
| **State**      | Zustand                          |
| **AI**         | OpenAI GPT-4, Whisper, TTS       |
| **Automation** | Make (Integromat), Airtable      |

## 📁 프로젝트 구조

```
skill-interview/
├── app/
│   ├── page.tsx              # 메인 페이지 (정보 입력)
│   ├── voice-test/           # 음성 테스트
│   ├── preparation/          # 면접 준비
│   ├── interview/            # AI 면접 진행
│   ├── result/               # 결과 확인
│   └── api/
│       ├── assistant/        # OpenAI Assistant API
│       ├── text-to-speech/   # TTS API
│       ├── speech-to-text/   # STT API
│       └── save-interview/   # 면접 데이터 저장
├── components/
│   ├── ui/                   # 공통 UI 컴포넌트
│   ├── WaveAnimation.tsx     # 음성 시각화
│   └── RecordButton.tsx      # 녹음 버튼
├── stores/
│   └── interviewStore.ts     # Zustand 상태 관리
├── lib/
│   ├── openai.ts             # OpenAI 설정
│   └── make.ts               # Make 웹훅 연동
└── types/
    └── index.ts              # TypeScript 타입 정의
```

## 시작하기

### 1. 설치

```bash
git clone https://github.com/your-username/skill-interview.git
cd skill-interview
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key
```

### 3. 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 사용 흐름

```
1. 정보 입력 → 2. 음성 테스트 → 3. 면접 준비 → 4. AI 면접 → 5. 결과 확인
```

1. **정보 입력**: 지원 직무, 연락처 입력
2. **음성 테스트**: 마이크 권한 확인 및 음성 테스트
3. **면접 준비**: 체크리스트 확인
4. **AI 면접**: 5개 질문에 음성으로 답변
5. **결과 확인**: 점수, 피드백, 모범 답안 확인

## Make 웹훅 설정 (선택)

면접 데이터를 Airtable에 저장하려면 Make 시나리오를 설정하세요:

1. **Webhook** → 데이터 수신
2. **Airtable** → 레코드 생성/업데이트
3. **OpenAI** → 면접 분석
4. **Webhook Response** → 분석 결과 반환

## 라이선스

MIT License

## 기여

이슈와 PR은 언제나 환영합니다!
