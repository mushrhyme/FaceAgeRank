import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleSheetsService } from "./googleSheets";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // 구글 시트 서비스 초기화 (환경 변수가 없으면 null)
  let googleSheetsService: GoogleSheetsService | null = null;
  try {
    googleSheetsService = new GoogleSheetsService();
  } catch (error) {
    console.warn("구글 시트 서비스 초기화 실패 (결과 저장 기능 비활성화):", error instanceof Error ? error.message : String(error));
  }

  // 회사/사번으로 사용자 조회
  app.post("/api/user/lookup", async (req, res) => {
    try {
      const schema = z.object({
        company: z.string().min(1),
        employeeId: z.string().min(1),
      });

      const { company, employeeId } = schema.parse(req.body);
      
      const user = await storage.getUserByCompanyAndEmployeeId(company, employeeId);
      
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
      const schema = z.object({
        company: z.string().min(1),
        employeeId: z.string().min(1),
        name: z.string().min(1),
        realAge: z.number().int().positive(),
        faceAge: z.number().int().positive(),
        ageDifference: z.number().int(),
        completedAt: z.string(), // ISO 8601 형식 날짜 문자열
      });

      const data = schema.parse(req.body);

      // 구글 시트 서비스가 초기화되지 않았으면 오류 반환
      if (!googleSheetsService) {
        return res.status(503).json({ error: "구글 시트 서비스가 설정되지 않았습니다." });
      }

      // 구글 시트에 저장
      await googleSheetsService.saveAnalysisResult(data);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      console.error("분석 결과 저장 실패:", error);
      res.status(500).json({ error: "결과 저장 중 오류가 발생했습니다." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
