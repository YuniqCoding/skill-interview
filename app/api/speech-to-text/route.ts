import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: '오디오 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // File을 Blob으로 변환하여 OpenAI에 전송
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko',
      response_format: 'text',
    });

    return NextResponse.json({
      success: true,
      data: {
        text: transcription,
      },
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { success: false, error: '음성 인식 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

