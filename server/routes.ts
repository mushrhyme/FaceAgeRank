import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { GoogleSheetsService } from "./googleSheets";
import { createFaceAgeService } from "./faceAgeService";
import { analysisResultSchema } from "../shared/schema";
import { sseService } from "./services/sseService";
import { AnalysisService } from "./services/analysisService";
import { RankingService } from "./services/rankingService";
import { UserService } from "./services/userService";

export async function registerRoutes(app: Express): Promise<Server> {
  // 구글 시트 서비스 초기화 (환경 변수가 없으면 null)
  let googleSheetsService: GoogleSheetsService | null = null;
  try {
    googleSheetsService = new GoogleSheetsService();
  } catch (error) {
    console.warn("⚠️ 구글 시트 서비스 초기화 실패 (결과 저장 기능 비활성화):", error instanceof Error ? error.message : String(error));
  }

  // 얼굴 나이 분석 서비스 초기화 (환경 변수가 없으면 null)
  const faceAgeService = createFaceAgeService();
  if (!faceAgeService) {
    console.warn("⚠️ 얼굴 나이 분석 서비스 비활성화됨 (시뮬레이션 모드)");
  }

  // 서비스 레이어 초기화
  const analysisService = new AnalysisService(faceAgeService, googleSheetsService);
  const rankingService = new RankingService(googleSheetsService);
  const userService = new UserService(storage);

  // 얼굴 나이 분석 API (Base64 이미지)
  // POST /api/analysis/face-age (JSON body: { image: "data:image/jpeg;base64,..." })
  app.post("/api/analysis/face-age", async (req, res) => {
    try {
      // Base64 이미지 처리
      if (!req.body.image) {
        return res.status(400).json({ error: "이미지 데이터가 필요합니다." });
      }

      // 얼굴 나이 분석
      const faceAge = await analysisService.analyzeFaceAgeFromBase64(req.body.image);
      res.json({ faceAge });
    } catch (error: any) {
      console.error("❌ 얼굴 나이 분석 실패:", error);
      res.status(500).json({ 
        error: "얼굴 나이 분석 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // 회사/사번으로 사용자 조회
  app.post("/api/user/lookup", async (req, res) => {
    try {
      const schema = z.object({
        company: z.string().min(1),
        employeeId: z.string().min(1),
      });

      const { company, employeeId } = schema.parse(req.body);
      
      const user = await userService.getUserByCompanyAndEmployeeId(company, employeeId);
      
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      }

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
  });

  // 분석 결과 저장
  app.post("/api/analysis/save", async (req, res) => {
    try {
      const data = analysisResultSchema.parse(req.body);

      // 분석 결과 저장 (서비스에서 SSE 브로드캐스트도 처리)
      await analysisService.saveAnalysisResult(data);

      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      console.error("❌ 분석 결과 저장 실패:");
      console.error("에러:", error);
      if (error?.message) {
        console.error("에러 메시지:", error.message);
      }
      
      // 구글 시트 서비스 관련 에러는 503 반환
      const statusCode = error?.message?.includes("구글 시트 서비스") ? 503 : 500;
      res.status(statusCode).json({ 
        error: error?.message || "결과 저장 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // 랭킹 데이터 조회
  app.get("/api/ranking", async (req, res) => {
    try {
      const rankingData = await rankingService.getRankingData();
      res.json(rankingData);
    } catch (error: any) {
      console.error("❌ 랭킹 데이터 조회 실패:");
      console.error("에러:", error);
      if (error?.message) {
        console.error("에러 메시지:", error.message);
      }
      
      // 구글 시트 서비스 관련 에러는 503 반환
      const statusCode = error?.message?.includes("구글 시트 서비스") ? 503 : 500;
      res.status(statusCode).json({ 
        error: error?.message || "랭킹 데이터 조회 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // SSE 스트림 엔드포인트 (랭킹 갱신 알림)
  app.get("/api/ranking/stream", (req, res) => {
    sseService.addClient(res);
  });

  const httpServer = createServer(app);

  return httpServer;
}
