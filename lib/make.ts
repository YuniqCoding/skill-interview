import type { SubmitInfoRequest, SaveInterviewRequest, ApiResponse, MakeWebhookResponse, InterviewResult } from '@/types';

// Make 웹훅 URL
const MAKE_WEBHOOK_SUBMIT_INFO = process.env.MAKE_WEBHOOK_SUBMIT_INFO || 'https://hook.eu2.make.com/otkr2enj642omkkuqv96tgc3nu9hf33v';
const MAKE_WEBHOOK_SAVE_INTERVIEW = process.env.MAKE_WEBHOOK_SAVE_INTERVIEW || 'https://hook.eu2.make.com/55dufb73cjh84rbqmyohnsghukbmyk23';

/**
 * Make 웹훅으로 사용자 정보 전송 (Airtable Candidates 테이블에 저장)
 */
export async function submitInfoToMake(
  data: SubmitInfoRequest
): Promise<ApiResponse<{ candidateId: string; message?: string }>> {
  try {
    console.log('Sending data to Make webhook:', MAKE_WEBHOOK_SUBMIT_INFO);
    
    const response = await fetch(MAKE_WEBHOOK_SUBMIT_INFO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_position: data.jobPosition,
        phone: data.phone,
        email: data.email,
        created_at: new Date().toISOString(),
      }),
    });

    console.log('Make webhook response status:', response.status);

    // Make 웹훅은 응답이 텍스트일 수 있음
    const responseText = await response.text();
    console.log('Make webhook response:', responseText);

    // 성공 시 (200-299 상태 코드)
    if (response.ok) {
      let candidateId = `id-${Date.now()}`;
      let message: string | undefined;
      
      // JSON 응답인 경우 파싱 시도
      try {
        const result: MakeWebhookResponse = JSON.parse(responseText);
        candidateId = result.candidateId || result.id || candidateId;
        message = result.message;
      } catch {
        // JSON이 아닌 경우 기본 ID 사용
      }
      
      return {
        success: true,
        data: { candidateId, message },
      };
    } else {
      throw new Error(`Make webhook failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error('Error submitting info to Make:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Make 웹훅으로 면접 결과 전송 (Airtable Interviews 테이블에 저장 + GPT 분석)
 */
export async function saveInterviewToMake(
  data: SaveInterviewRequest
): Promise<ApiResponse<{ interviewId: string; message?: string; analysis?: InterviewResult }>> {
  try {
    console.log('Sending interview data to Make webhook:', MAKE_WEBHOOK_SAVE_INTERVIEW);

    const response = await fetch(MAKE_WEBHOOK_SAVE_INTERVIEW, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: data.candidateId,
        job_position: data.jobPosition,
        phone: data.phone,
        email: data.email,
        questions: JSON.stringify(data.questions),
        answers: JSON.stringify(data.answers),
        duration: data.duration,
        created_at: new Date().toISOString(),
      }),
    });

    console.log('Make webhook response status:', response.status);

    const responseText = await response.text();
    console.log('Make webhook response (raw):', responseText);
    console.log('Response length:', responseText.length);

    if (response.ok) {
      let interviewId = `id-${Date.now()}`;
      let message: string | undefined;
      let analysis: InterviewResult | undefined;

      try {
        const result = JSON.parse(responseText);
        console.log('Parsed webhook result:', result);
        
        interviewId = result.id || result.interviewId || interviewId;
        message = result.message;
        
        // GPT 분석 결과가 있으면 추출
        if (result.interview_summary || result.interview_score) {
          console.log('Found analysis data in response');
          analysis = {
            interview_summary: result.interview_summary || '',
            model_answers: result.model_answers || '',
            interview_feedback: result.interview_feedback || '',
            interview_score: result.interview_score || {
              total: 0,
              details: {
                understanding: 0,
                logic: 0,
                practical_fit: 0,
                communication: 0,
              },
              reason: '',
            },
            candidate_analysis: result.candidate_analysis || '',
          };
          console.log('Analysis object created:', analysis);
        } else {
          console.log('No analysis data found in response');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // JSON이 아닌 경우 기본 ID 사용
      }

      return {
        success: true,
        data: { interviewId, message, analysis },
      };
    } else {
      throw new Error(`Make webhook failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error('Error saving interview to Make:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

