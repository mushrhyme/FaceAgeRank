/**
 * 랭킹 서비스
 * 랭킹 데이터 조회 로직 처리
 */

import type { GoogleSheetsService } from "../googleSheets";
import type { RankingData } from "../../shared/types";

export class RankingService {
  constructor(private googleSheetsService: GoogleSheetsService | null) {}

  /**
   * 랭킹 데이터 조회
   * @returns 랭킹 데이터 배열
   * @throws 구글 시트 서비스가 없으면 에러 발생
   */
  async getRankingData(): Promise<RankingData[]> {
    if (!this.googleSheetsService) {
      throw new Error("구글 시트 서비스가 설정되지 않았습니다.");
    }

    return await this.googleSheetsService.getRankingData();
  }
}

