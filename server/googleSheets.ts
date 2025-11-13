import { google } from "googleapis";
import type { RankingData, AnalysisResult } from "../shared/types";

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
      // JSON 문자열 파싱 시도
      let credentials;
      try {
        // 이미 JSON 객체인 경우와 문자열인 경우 모두 처리
        if (typeof serviceAccountKey === 'string') {
          // 문자열의 앞뒤 공백 제거
          let trimmed = serviceAccountKey.trim();
          
          // 작은따옴표나 큰따옴표로 감싸져 있으면 제거
          if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
              (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            trimmed = trimmed.slice(1, -1);
            // 이스케이프된 따옴표 복원
            trimmed = trimmed.replace(/\\"/g, '"').replace(/\\'/g, "'");
          }
          
          credentials = JSON.parse(trimmed);
        } else {
          credentials = serviceAccountKey;
        }
      } catch (parseError) {
        throw new Error(`GOOGLE_SERVICE_ACCOUNT_KEY JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}. 환경 변수가 올바른 JSON 형식인지 확인하세요.`);
      }

      // 서비스 계정 인증
      const auth = new google.auth.GoogleAuth({
        credentials, // 파싱된 JSON 객체
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
  async saveAnalysisResult(data: AnalysisResult): Promise<boolean> {
    try {
      // 헤더가 없으면 먼저 헤더 추가
      await this.ensureHeaders();

      // 데이터 행 추가
      // completedAt 앞에 작은따옴표(')를 붙여서 텍스트로 강제 저장 (구글 시트가 날짜로 변환하지 않도록)
      const values = [
        [
          data.company,
          data.employeeId,
          data.name,
          data.department, // 부서명
          data.realAge.toString(),
          data.faceAge.toString(),
          data.ageDifference.toString(),
          `'${data.completedAt}`, // 작은따옴표로 시작하여 텍스트로 강제 저장
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:H", // A열부터 H열까지 (부서명 추가)
        valueInputOption: "USER_ENTERED", // 사용자가 입력한 것처럼 처리 (날짜 형식 자동 인식)
        insertDataOption: "INSERT_ROWS", // 새 행 삽입
        requestBody: {
          values,
        },
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
        range: "Sheet1!A1:H1", // 첫 번째 행의 A~H열 (부서명 추가)
      });

      const rows = response.data.values;

      // 헤더가 없거나 비어있으면 헤더 추가
      if (!rows || rows.length === 0 || !rows[0] || rows[0].length === 0) {
        const headers = [
          ["회사", "사번", "이름", "부서명", "실제 나이", "얼굴 나이", "나이 차이", "분석 완료 시각"],
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: "Sheet1!A1:H1",
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

  /**
   * Excel 시리얼 번호를 날짜 문자열로 변환
   * 구글 시트가 날짜를 숫자 형식(예: 45972.634212963)으로 저장하는 경우를 처리
   * 
   * @param value 날짜 값 (문자열 또는 숫자)
   * @returns "YYYY-MM-DD HH:MM:SS" 형식의 날짜 문자열
   */
  private convertExcelSerialToDateString(value: any): string {
    // 빈 값 처리
    if (value === null || value === undefined || value === "") {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 문자열인 경우 작은따옴표로 시작하면 제거 (구글 시트에서 텍스트로 저장된 경우)
    let processedValue = value;
    if (typeof value === "string" && value.startsWith("'")) {
      processedValue = value.substring(1);
    }

    // 이미 올바른 문자열 형식이면 그대로 반환
    if (typeof processedValue === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(processedValue)) {
      return processedValue;
    }

    // 숫자 형식이면 Excel 시리얼 번호로 간주하고 변환
    let serialNumber: number;
    if (typeof value === "number") {
      serialNumber = value;
    } else if (typeof processedValue === "string") {
      // 문자열이 숫자로 변환 가능한지 확인
      const parsed = parseFloat(processedValue);
      if (isNaN(parsed)) {
        // 숫자가 아닌 문자열이면 현재 시간 반환
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      serialNumber = parsed;
    } else {
      // 변환 불가능한 타입이면 현재 시간 반환
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Excel 시리얼 번호를 JavaScript Date로 변환
    // Excel 기준일: 1900년 1월 1일 = 1
    // JavaScript Date 기준: 1899년 12월 30일 = Excel 1
    const excelEpoch = new Date(1899, 11, 30); // 1899년 12월 30일 (월은 0부터 시작)
    const days = Math.floor(serialNumber);
    const timeFraction = serialNumber - days;
    
    const date = new Date(excelEpoch);
    date.setDate(date.getDate() + days);
    
    // 시간 부분 추가 (소수점 부분을 시간으로 변환)
    const hours = Math.floor(timeFraction * 24);
    const minutes = Math.floor((timeFraction * 24 - hours) * 60);
    const seconds = Math.floor(((timeFraction * 24 - hours) * 60 - minutes) * 60);
    
    date.setHours(hours, minutes, seconds);

    // KST(UTC+9)로 변환하여 "YYYY-MM-DD HH:MM:SS" 형식으로 포맷팅
    const kstOffset = 9 * 60; // KST는 UTC+9 (분 단위)
    const kstTime = new Date(date.getTime() + (kstOffset + date.getTimezoneOffset()) * 60000);
    
    const year = kstTime.getFullYear();
    const month = String(kstTime.getMonth() + 1).padStart(2, "0");
    const day = String(kstTime.getDate()).padStart(2, "0");
    const hoursStr = String(kstTime.getHours()).padStart(2, "0");
    const minutesStr = String(kstTime.getMinutes()).padStart(2, "0");
    const secondsStr = String(kstTime.getSeconds()).padStart(2, "0");
    
    const result = `${year}-${month}-${day} ${hoursStr}:${minutesStr}:${secondsStr}`;
    
    return result;
  }

  /**
   * 구글 시트에서 랭킹 데이터 조회
   * 나이 차이(실제 나이 - 얼굴 나이) 기준으로 내림차순 정렬
   * 
   * @returns 랭킹 데이터 배열
   */
  async getRankingData(): Promise<RankingData[]> {
    try {
      // 전체 데이터 읽기 (헤더 포함)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:H", // A열부터 H열까지 전체 (부서명 추가)
      });

      const rows = response.data.values;

      // 데이터가 없으면 빈 배열 반환
      if (!rows || rows.length <= 1) {
        return [];
      }

      // 헤더 제외하고 데이터만 추출
      const dataRows = rows.slice(1);

      // 헤더 확인하여 컬럼 구조 파악
      const header = rows[0] || [];
      const hasDepartment = header.includes("부서명");

      // 데이터 파싱
      const parsedData = dataRows
        .map((row: any[], index: number) => {
          // 헤더에 부서명이 있으면 새로운 형식, 없으면 기존 형식
          let company, employeeId, name, department, realAge, faceAge, ageDifference, completedAt;
          
          if (hasDepartment) {
            // 새로운 형식: 회사, 사번, 이름, 부서명, 실제 나이, 얼굴 나이, 나이 차이, 분석 완료 시각
            company = row[0] || "";
            employeeId = row[1] || "";
            name = row[2] || "";
            department = row[3] || "";
            realAge = parseInt(row[4] || "0", 10);
            faceAge = parseInt(row[5] || "0", 10);
            ageDifference = parseInt(row[6] || "0", 10);
            completedAt = this.convertExcelSerialToDateString(row[7] || ""); // Excel 시리얼 번호 변환
          } else {
            // 기존 형식: 회사, 사번, 이름, 실제 나이, 얼굴 나이, 나이 차이, 분석 완료 시각
            company = row[0] || "";
            employeeId = row[1] || "";
            name = row[2] || "";
            department = ""; // 부서명 없음
            realAge = parseInt(row[3] || "0", 10);
            faceAge = parseInt(row[4] || "0", 10);
            ageDifference = parseInt(row[5] || "0", 10);
            completedAt = this.convertExcelSerialToDateString(row[6] || ""); // Excel 시리얼 번호 변환
          }

          // 유효한 데이터만 반환
          // name이 없거나, realAge나 faceAge가 유효하지 않은 경우 필터링
          if (!name || isNaN(realAge) || isNaN(faceAge) || realAge <= 0 || faceAge <= 0) {
            return null;
          }

          return {
            company,
            employeeId,
            name,
            department, // 부서명
            realAge,
            faceAge,
            ageDifference,
            completedAt,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null); // null 제거

      // 사번 기준 중복 제거
      // 같은 사번이 여러 개 있으면 무조건 최신 시간만 선택
      const uniqueByEmployeeId = new Map<string, typeof parsedData[0]>();
      
      for (const item of parsedData) {
        const existing = uniqueByEmployeeId.get(item.employeeId);
        
        if (!existing) {
          // 첫 번째 데이터는 그대로 추가
          uniqueByEmployeeId.set(item.employeeId, item);
        } else {
          // 최신 시간만 선택
          if (new Date(item.completedAt) > new Date(existing.completedAt)) {
            uniqueByEmployeeId.set(item.employeeId, item);
          }
        }
      }

      // 절댓값 기준 내림차순 정렬 (절댓값이 같으면 양수(+) 우선)
      const rankingData = Array.from(uniqueByEmployeeId.values())
        .sort((a, b) => {
          const absA = Math.abs(a.ageDifference);
          const absB = Math.abs(b.ageDifference);
          
          // 절댓값 기준으로 먼저 정렬 (내림차순)
          if (absB !== absA) {
            return absB - absA;
          }
          
          // 절댓값이 같으면 양수(+)를 우선
          if (a.ageDifference > 0 && b.ageDifference < 0) {
            return -1; // a가 양수면 a를 앞으로
          }
          if (a.ageDifference < 0 && b.ageDifference > 0) {
            return 1; // b가 양수면 b를 앞으로
          }
          
          // 둘 다 양수이거나 둘 다 음수면 최신 시간 우선
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        });

      return rankingData;
    } catch (error: any) {
      console.error("❌ 구글 시트 랭킹 데이터 조회 실패:");
      console.error("에러 타입:", error?.constructor?.name);
      console.error("에러 메시지:", error?.message);
      if (error?.response) {
        console.error("API 응답 상태:", error.response.status);
        console.error("API 응답 데이터:", error.response.data);
      }
      throw error;
    }
  }
}

