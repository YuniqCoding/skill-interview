import { NextRequest, NextResponse } from "next/server";
import { openai, getInterviewPrompt } from "@/lib/openai";
import type { JobPosition } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { success: false, error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { jobPosition, questionCount = 5 } = body as {
      jobPosition: JobPosition;
      questionCount?: number;
    };

    if (!jobPosition) {
      return NextResponse.json(
        { success: false, error: "직무를 선택해주세요." },
        { status: 400 }
      );
    }

    const prompt = getInterviewPrompt(jobPosition, questionCount);

    console.log("Generating questions for:", jobPosition);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 기술 면접관입니다. 주어진 형식에 맞게 JSON으로만 응답해주세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    const result = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
      },
    });
  } catch (error) {
    console.error("Generate question error:", error);
    return NextResponse.json(
      { success: false, error: "질문 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
