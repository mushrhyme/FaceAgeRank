import { google } from "googleapis";

/**
 * 구글 시트에 분석 결과를 저장하는 서비스 클래스
 * 
 * 사용 전 설정 필요:
 * 1. Google Cloud Console에서 서비스 계정 생성
 * 2. 서비스 계정 키 JSON 파일 다운로드
 * 3. 환경 변수 GOOGLE_SERVICE_ACCOUNT_KEY에 JSON 내용 설정
 * 4. 구글 스프레드시트에 서비스 계정 이메일 공유 (편집 권한)
 */
export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    // 환경 변수에서 설정 가져오기
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!serviceAccountKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.");
    }

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID 환경 변수가 설정되지 않았습니다.");
    }

    this.spreadsheetId = spreadsheetId;

    try {
      // 서비스 계정 인증
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(serviceAccountKey), // JSON 문자열을 파싱
        scopes: ["https://www.googleapis.com/auth/spreadsheets"], // 스프레드시트 접근 권한
      });

      this.sheets = google.sheets({ version: "v4", auth });
    } catch (error) {
      throw new Error(`구글 시트 인증 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 분석 결과를 구글 시트에 추가
   * 
   * @param data 저장할 분석 결과 데이터
   * @returns 성공 여부
   */
  async saveAnalysisResult(data: {
    company: string;        // 회사명
    employeeId: string;     // 사번
    name: string;           // 이름
    realAge: number;        // 실제 나이
    faceAge: number;        // 얼굴 나이
    ageDifference: number;  // 나이 차이 (실제 나이 - 얼굴 나이)
    completedAt: string;    // 분석 완료 시각 (ISO 8601 형식)
  }): Promise<boolean> {
    try {
      // 헤더가 없으면 먼저 헤더 추가
      await this.ensureHeaders();

      // 데이터 행 추가
      const values = [
        [
          data.company,
          data.employeeId,
          data.name,
          data.realAge.toString(),
          data.faceAge.toString(),
          data.ageDifference.toString(),
          data.completedAt,
        ],
      ];

      console.log("📝 구글 시트에 데이터 추가 시도:", {
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:G",
        values: values[0],
      });

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:G", // A열부터 G열까지
        valueInputOption: "USER_ENTERED", // 사용자가 입력한 것처럼 처리 (날짜 형식 자동 인식)
        insertDataOption: "INSERT_ROWS", // 새 행 삽입
        requestBody: {
          values,
        },
      });

      console.log("✅ 구글 시트 API 응답:", {
        updatedRows: response.data.updates?.updatedRows,
        updatedCells: response.data.updates?.updatedCells,
      });

      return true;
    } catch (error: any) {
      console.error("❌ 구글 시트 저장 실패:");
      console.error("에러 타입:", error?.constructor?.name);
      console.error("에러 메시지:", error?.message);
      if (error?.response) {
        console.error("API 응답 상태:", error.response.status);
        console.error("API 응답 데이터:", error.response.data);
      }
      if (error?.code) {
        console.error("에러 코드:", error.code);
      }
      throw error;
    }
  }

  /**
   * 시트에 헤더가 없으면 추가
   */
  private async ensureHeaders(): Promise<void> {
    try {
      // 첫 번째 행 읽기
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A1:G1", // 첫 번째 행의 A~G열
      });

      const rows = response.data.values;

      // 헤더가 없거나 비어있으면 헤더 추가
      if (!rows || rows.length === 0 || !rows[0] || rows[0].length === 0) {
        const headers = [
          ["회사", "사번", "이름", "실제 나이", "얼굴 나이", "나이 차이", "분석 완료 시각"],
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: "Sheet1!A1:G1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: headers,
          },
        });
      }
    } catch (error) {
      // 시트가 비어있거나 접근 오류인 경우 헤더 추가 시도
      console.warn("헤더 확인 중 오류 (무시하고 계속 진행):", error);
    }
  }
}

