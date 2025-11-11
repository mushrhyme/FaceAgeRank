/**
 * 공통 타입 정의
 * 클라이언트와 서버에서 공유하는 타입들을 정의합니다.
 */

// schema.ts에서 정의된 타입들을 import
import type { RankingData as RankingDataType } from "./schema";

// schema.ts에서 정의된 타입들을 re-export
export type { User, InsertUser, AnalysisResult, RankingData } from "./schema";

// 순위가 포함된 랭킹 데이터 타입
export type RankedData = RankingDataType & {
  rank: number;          // 순위 (동점 처리 포함)
};

// 로그인 정보 타입
export interface LoginInfo {
  company: string;
  employeeId: string;
}

// 홈 페이지 단계 타입 (UI 상태)
export type Step = "login" | "welcome" | "guide" | "webcam" | "loading" | "result";

