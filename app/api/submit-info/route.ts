import { NextRequest, NextResponse } from 'next/server';
import { submitInfoToMake } from '@/lib/make';
import type { SubmitInfoRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitInfoRequest = await request.json();

    // 유효성 검사
    if (!body.jobPosition || !body.phone || !body.email) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Make 웹훅으로 데이터 전송 (Airtable에 저장)
    const result = await submitInfoToMake(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { 
          candidateId: result.data?.candidateId,
          message: result.data?.message || '지원자 정보가 등록되었습니다!',
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Submit info error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


