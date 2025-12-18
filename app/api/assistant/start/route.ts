import { NextRequest, NextResponse } from 'next/server';
import { openai, INTERVIEW_ASSISTANT_ID } from '@/lib/openai';
import { JOB_POSITION_LABELS, type JobPosition } from '@/types';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { jobPosition } = body as { jobPosition: JobPosition };

    if (!jobPosition) {
      return NextResponse.json(
        { success: false, error: '직무를 선택해주세요.' },
        { status: 400 }
      );
    }

    const jobLabel = JOB_POSITION_LABELS[jobPosition] || jobPosition;

    console.log('Starting interview for:', jobLabel);

    // 1. Thread 생성
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log('Thread created:', threadId);

    // 2. 첫 메시지 추가 (면접 시작 요청)
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: `안녕하세요. 저는 ${jobLabel} 포지션에 지원했습니다. 기술 면접을 시작해주세요. 총 5개의 질문을 해주시고, 한 번에 하나의 질문만 해주세요.`,
    });

    // 3. Run 실행 및 완료 대기 (createAndPoll 사용)
    console.log('Creating and polling run...');
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: INTERVIEW_ASSISTANT_ID,
    });
    
    console.log('Run completed with status:', run.status);
    
    if (run.status !== 'completed') {
      throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
    }

    // 5. Assistant 응답 가져오기
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find((m) => m.role === 'assistant');
    
    let firstQuestion = '';
    if (assistantMessage && assistantMessage.content[0].type === 'text') {
      firstQuestion = assistantMessage.content[0].text.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        threadId: thread.id,
        question: firstQuestion,
        questionNumber: 1,
      },
    });
  } catch (error) {
    console.error('Assistant start error:', error);
    return NextResponse.json(
      { success: false, error: '면접 시작 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

