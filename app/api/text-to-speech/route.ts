import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'nova' } = body as {
      text: string;
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    };

    if (!text) {
      return NextResponse.json(
        { success: false, error: '텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    // ArrayBuffer로 변환
    const arrayBuffer = await mp3Response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Base64로 인코딩하여 반환
    const base64Audio = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        audio: base64Audio,
        format: 'mp3',
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { success: false, error: '음성 변환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


