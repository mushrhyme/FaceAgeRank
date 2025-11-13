/**
 * 얼굴 나이 분석 서비스
 * 이미지 분석 및 결과 저장 로직 처리
 */

import type { FaceAgeService } from "../faceAgeService";
import type { GoogleSheetsService } from "../googleSheets";
import type { AnalysisResult } from "../../shared/types";
import { sseService } from "./sseService";

export class AnalysisService {
  constructor(
    private faceAgeService: FaceAgeService | null,
    private googleSheetsService: GoogleSheetsService | null
  ) {}

  /**
   * Base64 이미지 문자열을 Buffer로 변환
   * @param base64Data Base64 인코딩된 이미지 데이터
   * @returns 이미지 Buffer
   */
  private parseBase64Image(base64Data: string): Buffer {
    // "data:image/jpeg;base64," 같은 prefix 제거
    const base64String = base64Data.includes(",") 
      ? base64Data.split(",")[1] 
      : base64Data;
    return Buffer.from(base64String, "base64");
  }

  /**
   * Base64 이미지로부터 얼굴 나이 분석
   * @param base64Image Base64 인코딩된 이미지 데이터
   * @returns 얼굴 나이와 분석 시간
   */
  async analyzeFaceAgeFromBase64(base64Image: string): Promise<number | { age: number; analysisTime?: number }> {
    const imageBuffer = this.parseBase64Image(base64Image);
    
    if (this.faceAgeService) {
      return await this.faceAgeService.predictAge(imageBuffer);
    } else {
      // 서비스가 없으면 시뮬레이션 (임시)
      const randomAge = Math.floor(Math.random() * 30) + 20;
      console.warn(`⚠️ 얼굴 나이 분석 서비스가 없어 랜덤 값 반환: ${randomAge}세`);
      return randomAge;
    }
  }

  /**
   * 분석 결과 저장
   * @param data 분석 결과 데이터
   * @throws 구글 시트 서비스가 없으면 에러 발생
   */
  async saveAnalysisResult(data: AnalysisResult): Promise<void> {
    if (!this.googleSheetsService) {
      throw new Error("구글 시트 서비스가 설정되지 않았습니다.");
    }

    // 구글 시트에 저장
    await this.googleSheetsService.saveAnalysisResult(data);

    // SSE로 모든 연결된 클라이언트에게 랭킹 갱신 알림 전송
    sseService.broadcast("ranking-updated", {
      message: "랭킹이 업데이트되었습니다",
      timestamp: new Date().toISOString(),
    });
  }
}

