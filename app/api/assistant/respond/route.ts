import { NextRequest, NextResponse } from 'next/server';
import { openai, INTERVIEW_ASSISTANT_ID } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { threadId, answer, questionNumber } = body as {
      threadId: string;
      answer: string;
      questionNumber: number;
    };

    if (!threadId || !answer) {
      return NextResponse.json(
        { success: false, error: 'threadId와 answer가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 사용자 답변 추가
    let userMessage = answer;
    
    // 마지막 질문이 아니면 다음 질문 요청
    if (questionNumber < 5) {
      userMessage = `${answer}\n\n(다음 질문을 해주세요. 현재 ${questionNumber}번째 질문이 완료되었습니다.)`;
    } else {
      userMessage = `${answer}\n\n(모든 질문이 완료되었습니다. 면접을 마무리해주세요.)`;
    }

    console.log('Processing answer for thread:', threadId, 'question:', questionNumber);

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage,
    });

    // 2. Run 실행 및 완료 대기 (createAndPoll 사용)
    console.log('Creating and polling run...');
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: INTERVIEW_ASSISTANT_ID,
    });
    
    console.log('Run completed with status:', run.status);
    
    if (run.status !== 'completed') {
      throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
    }

    // 4. Assistant 응답 가져오기
    const messages = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const assistantMessage = messages.data[0];
    
    let responseText = '';
    if (assistantMessage && assistantMessage.role === 'assistant' && assistantMessage.content[0].type === 'text') {
      responseText = assistantMessage.content[0].text.value;
    }

    const isCompleted = questionNumber >= 5;

    return NextResponse.json({
      success: true,
      data: {
        response: responseText,
        questionNumber: questionNumber + 1,
        isCompleted,
      },
    });
  } catch (error) {
    console.error('Assistant respond error:', error);
    return NextResponse.json(
      { success: false, error: '응답 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

