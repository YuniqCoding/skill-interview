# AI 기술 인터뷰 프로그램 PRD

## 📋 프로젝트 개요

AI 기반 기술 면접 시뮬레이션 프로그램으로, 사용자가 직무를 선택하고 AI와 실시간 음성 대화를 통해 기술 면접을 진행합니다. 면접 종료 후 AI가 답변을 분석하여 점수와 피드백을 제공합니다.

---

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (음파 애니메이션)
- **State Management**: Zustand
- **Audio Visualization**: Web Audio API

### Backend & AI

- **AI Model**: OpenAI GPT-4 (면접 질문 생성 & 답변 분석)
- **Text-to-Speech**: OpenAI TTS API (AI 음성 출력)
- **Speech-to-Text**: OpenAI Whisper API (사용자 음성 인식)

### Integration

- **Automation**: Make (Integromat)
- **Database**: Airtable
- **API Communication**: REST API

### Deployment

- **Hosting**: Vercel

---

## 🎯 핵심 기능

1. **사용자 정보 수집**: 직무 선택, 연락처 입력
2. **음성 테스트**: 마이크 권한 확인 및 음성 인식 테스트
3. **AI 면접 진행**: 실시간 음성 기반 Q&A
4. **결과 분석**: AI 기반 점수 산출 및 피드백 제공
5. **데이터 저장**: 모든 면접 기록 Airtable 저장

---

## 📱 화면 구성

### Screen 1: 시작 화면 (정보 입력)

### Screen 2: 음성 테스트

### Screen 3: 면접 준비 (체크리스트)

### Screen 4: AI 면접 진행

### Screen 5: 결과 화면

---

## 📝 상세 태스크 (Step by Step)

---

## Phase 1: 프로젝트 초기 설정 ✅

### Task 1.1: 프로젝트 환경 구축

- [v] Next.js 14 프로젝트 생성 (TypeScript)
- [v] Tailwind CSS 설정
- [v] Framer Motion 설치
- [v] Zustand 설치
- [v] 폴더 구조 설정

### Task 1.2: 환경 변수 설정

- [v] `.env.local` 파일 생성
- [v] OpenAI API Key 설정
- [v] Make Webhook URL 설정
- [v] Airtable 관련 설정

---

## Phase 2: 시작 화면 (정보 입력) ✅

### Task 2.1: UI 컴포넌트 개발

- [v] 메인 레이아웃 컴포넌트
- [v] 직무 선택 드롭다운/카드 UI
  - 프론트엔드 개발자
  - 백엔드 개발자
  - 풀스택 개발자
  - 데이터 엔지니어
  - DevOps 엔지니어
  - AI/ML 엔지니어
  - Technical Project Manager (TPM)
- [v] 전화번호 입력 필드 (유효성 검사)
- [v] 이메일 입력 필드 (유효성 검사)
- [v] "면접 시작" 버튼

### Task 2.2: 상태 관리 설정

- [v] Zustand 스토어 생성
- [v] 사용자 정보 상태 (직무, 전화번호, 이메일)
- [v] 면접 진행 상태 관리

### Task 2.3: Make 웹훅 연동

- [v] Make 시나리오 생성 (Webhook → Airtable)
- [v] Airtable 테이블 구조 설계
  - `Candidates` 테이블: id, job_position, phone, email, created_at
- [v] API 라우트 생성 (`/api/submit-info`)
- [v] 폼 제출 시 Make 웹훅 호출
- [v] 웹훅 URL: `https://hook.eu2.make.com/otkr2enj642omkkuqv96tgc3nu9hf33v`
- [v] Make에서 Webhook Response로 등록 확인 메시지 반환

---

## Phase 3: 음성 테스트 화면 ✅

### Task 3.1: 마이크 권한 처리

- [v] 브라우저 마이크 권한 요청
- [v] 권한 상태 표시 UI
- [v] 권한 거부 시 안내 메시지

### Task 3.2: 음성 인식 테스트

- [v] Web Audio API 설정
- [v] 음성 입력 감지 로직
- [v] 테스트 문구 표시 ("안녕하세요, 테스트입니다" 등)

### Task 3.3: 음파 시각화 애니메이션

- [v] Canvas 또는 SVG 기반 음파 컴포넌트
- [v] 실시간 오디오 레벨 분석
- [v] Framer Motion 애니메이션 적용
- [v] 음성 인식 중/완료 상태 표시

### Task 3.4: 테스트 완료 처리

- [v] 음성 인식 성공 여부 판단
- [v] 성공 시 다음 단계로 이동
- [v] 실패 시 재시도 옵션 제공

---

## Phase 4: 면접 준비 화면 ✅

### Task 4.1: 체크리스트 UI

- [v] 체크리스트 컴포넌트 개발
- [v] 체크 항목 목록:
  - ✅ 조용한 환경에서 진행해 주세요
  - ✅ 마이크가 정상 작동하는지 확인했습니다
  - ✅ 예상 소요 시간: 10-15분
  - ✅ AI가 질문을 마치면 녹음 버튼을 눌러 답변해 주세요
  - ✅ 답변을 마치면 정지 버튼을 눌러주세요
- [v] 체크 애니메이션 효과

### Task 4.2: 면접 시작 버튼

- [v] 모든 체크 완료 시 버튼 활성화
- [v] "면접 시작하기" 버튼 UI
- [v] 클릭 시 면접 화면으로 전환

---

## Phase 5: AI 면접 진행 화면 ✅

### Task 5.1: AI 질문 생성 시스템

- [v] OpenAI API 라우트 생성 (`/api/generate-question`)
- [v] 직무별 기술 면접 질문 프롬프트 설계
- [v] 질문 개수 설정 (기본 5개)
- [v] 질문 난이도 조절 로직

### Task 5.2: Text-to-Speech (AI 음성 출력)

- [v] OpenAI TTS API 연동 (`/api/text-to-speech`)
- [v] 오디오 재생 컴포넌트
- [v] AI 음성 재생 상태 관리
- [v] 재생 중 시각적 표시 (AI 아바타 애니메이션)

### Task 5.3: 녹음 기능 구현

- [v] MediaRecorder API 활용
- [v] 녹음 버튼 컴포넌트
  - 비활성화 상태 (AI 말하는 중)
  - 활성화 상태 (녹음 가능)
  - 녹음 중 상태 (빨간색 표시)
- [v] 녹음 정지 버튼
- [v] 녹음 시간 표시

### Task 5.4: Speech-to-Text (사용자 답변 인식)

- [v] OpenAI Whisper API 연동 (`/api/speech-to-text`)
- [v] 오디오 파일 업로드 처리
- [v] 텍스트 변환 결과 저장

### Task 5.5: 면접 진행 플로우

- [v] 질문/답변 사이클 관리

```
1. AI 질문 생성 → TTS로 음성 출력
2. 녹음 버튼 활성화
3. 사용자 녹음 시작
4. 녹음 정지 → STT로 텍스트 변환
5. 다음 질문으로 이동 (반복)
6. 모든 질문 완료 시 결과 화면으로
```

- [v] 진행 상황 표시 (예: 질문 2/5)
- [v] 질문/답변 데이터 저장

### Task 5.6: 음파 애니메이션 (면접 중)

- [v] 사용자 음성 입력 시 음파 표시
- [v] AI 음성 출력 시 음파 표시
- [v] 상태별 색상/스타일 구분

---

## Phase 6: 결과 분석 및 저장

### Task 6.1: Airtable 데이터 저장

- [ ] Make 시나리오 확장 (웹훅 URL: `https://hook.eu2.make.com/55dufb73cjh84rbqmyohnsghukbmyk23`)
- [v] `Interviews` 테이블 구조:
  - id
  - candidate_id (Candidates 테이블 연결)
  - job_position
  - phone
  - email
  - questions (JSON 형태)
  - answers (JSON 형태)
  - duration (면접 소요시간, 초)
  - created_at
- [v] 면접 완료 시 데이터 전송 API (`/api/save-interview`)
- [v] 면접 종료 버튼 추가 (면접 완료 후 활성화)

### Task 6.2: AI 면접 분석 (Make GPT 모듈)

- [v] Make 시나리오에서 GPT 모듈로 분석 수행
- [v] GPT 분석 응답 구조:
  ```json
  {
    "interview_summary": "면접 요약",
    "model_answers": "모범 답안",
    "interview_feedback": "면접 피드백",
    "interview_score": {
      "total": 0,
      "details": {
        "understanding": 0,
        "logic": 0,
        "practical_fit": 0,
        "communication": 0
      },
      "reason": "점수 산정 이유"
    },
    "candidate_analysis": "지원자 분석"
  }
  ```
- [v] 웹훅 응답으로 분석 결과 반환

---

## Phase 7: 결과 화면

### Task 7.1: 결과 UI 개발

- [v] 점수 표시 컴포넌트 (원형 게이지/숫자)
- [v] 점수 애니메이션 효과
- [v] 등급 표시 (S/A/B/C/D)
  - 90-100: S
  - 80-89: A
  - 70-79: B
  - 60-69: C
  - 60 미만: D

### Task 7.2: 피드백 표시

- [v] 세부 점수 카드
  - 이해력 (understanding)
  - 논리력 (logic)
  - 실무 적합성 (practical_fit)
  - 커뮤니케이션 (communication)
- [v] 면접 요약 표시
- [v] 피드백 및 지원자 분석 표시
- [v] 모범 답안 표시

### Task 7.3: 추가 기능

- [ ] 결과 공유 기능 (선택적)
- [ ] 다시 시작하기 버튼
- [ ] 홈으로 돌아가기 버튼

---

## Phase 8: 최종 테스트 및 배포

### Task 8.1: 통합 테스트

- [ ] 전체 플로우 테스트
- [ ] 에러 핸들링 검증
- [ ] 반응형 디자인 테스트

### Task 8.2: 성능 최적화

- [ ] API 응답 시간 최적화
- [ ] 오디오 파일 압축
- [ ] 로딩 상태 UX 개선

### Task 8.3: 배포

- [ ] Vercel 배포 설정
- [ ] 환경 변수 설정
- [ ] 도메인 연결 (선택적)

---

## 🗂 Airtable 테이블 구조

### Candidates 테이블

| 필드명       | 타입          | 설명      |
| ------------ | ------------- | --------- |
| id           | Auto Number   | 고유 ID   |
| job_position | Single Select | 지원 직무 |
| phone        | Phone         | 전화번호  |
| email        | Email         | 이메일    |
| created_at   | Created Time  | 생성 시간 |

### Interviews 테이블

| 필드명       | 타입               | 설명                |
| ------------ | ------------------ | ------------------- |
| id           | Auto Number        | 고유 ID             |
| candidate_id | Link to Candidates | 지원자 연결         |
| questions    | Long Text          | 질문 목록 (JSON)    |
| answers      | Long Text          | 답변 목록 (JSON)    |
| score        | Number             | 총점 (0-100)        |
| feedback     | Long Text          | AI 피드백           |
| duration     | Number             | 면접 소요 시간 (초) |
| created_at   | Created Time       | 생성 시간           |

---

## 🔗 Make (Integromat) 시나리오

### 시나리오 1: 지원자 정보 저장

```
Webhook (Trigger) → Airtable: Create Record (Candidates)
```

### 시나리오 2: 면접 결과 저장

```
Webhook (Trigger) → Airtable: Create Record (Interviews)
```

---

## 📁 프로젝트 폴더 구조

```
skill-interview/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 시작 화면
│   ├── voice-test/
│   │   └── page.tsx                # 음성 테스트
│   ├── preparation/
│   │   └── page.tsx                # 면접 준비
│   ├── interview/
│   │   └── page.tsx                # AI 면접
│   ├── result/
│   │   └── page.tsx                # 결과 화면
│   └── api/
│       ├── submit-info/
│       │   └── route.ts            # 사용자 정보 제출
│       ├── generate-question/
│       │   └── route.ts            # AI 질문 생성
│       ├── text-to-speech/
│       │   └── route.ts            # TTS
│       ├── speech-to-text/
│       │   └── route.ts            # STT
│       ├── analyze-interview/
│       │   └── route.ts            # 면접 분석
│       └── save-interview/
│           └── route.ts            # 결과 저장
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   └── Checkbox.tsx
│   ├── WaveAnimation.tsx           # 음파 애니메이션
│   ├── RecordButton.tsx            # 녹음 버튼
│   ├── AIAvatar.tsx                # AI 아바타
│   ├── ScoreGauge.tsx              # 점수 게이지
│   └── FeedbackCard.tsx            # 피드백 카드
├── stores/
│   └── interviewStore.ts           # Zustand 스토어
├── lib/
│   ├── openai.ts                   # OpenAI 유틸리티
│   └── make.ts                     # Make 웹훅 유틸리티
├── types/
│   └── index.ts                    # TypeScript 타입 정의
├── public/
│   └── ...
├── .env.local
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## ⏱ 예상 개발 일정

| Phase                  | 예상 소요 시간 |
| ---------------------- | -------------- |
| Phase 1: 초기 설정     | 2시간          |
| Phase 2: 시작 화면     | 4시간          |
| Phase 3: 음성 테스트   | 6시간          |
| Phase 4: 면접 준비     | 2시간          |
| Phase 5: AI 면접       | 10시간         |
| Phase 6: 결과 분석     | 6시간          |
| Phase 7: 결과 화면     | 4시간          |
| Phase 8: 테스트 & 배포 | 4시간          |
| **총합**               | **약 38시간**  |

---

## 🔑 필요한 API 키 및 설정

1. **OpenAI API Key**: GPT-4, Whisper, TTS 사용
2. **Make 계정**: 웹훅 URL 생성
3. **Airtable 계정**:
   - Base ID
   - Table ID
   - API Key (Personal Access Token)

---

## 💡 추가 고려사항

### 보안

- API 키는 서버 사이드에서만 사용
- 사용자 개인정보 암호화 고려

### UX 개선

- 로딩 스피너 및 스켈레톤 UI
- 에러 발생 시 친절한 안내 메시지
- 면접 중 네트워크 오류 복구 로직

### 확장 가능성

- 다국어 지원
- 커스텀 질문 세트 추가
- 면접 녹화 기능
- 이전 면접 기록 조회
