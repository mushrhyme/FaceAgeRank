import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleSheetsService } from "./googleSheets";
import { z } from "zod";

// SSE 연결된 클라이언트 목록 관리
const sseClients: Set<Response> = new Set();

// 모든 SSE 클라이언트에게 이벤트 전송
function broadcastToSSEClients(event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (error) {
      // 연결이 끊어진 클라이언트는 목록에서 제거
      sseClients.delete(client);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 구글 시트 서비스 초기화 (환경 변수가 없으면 null)
  let googleSheetsService: GoogleSheetsService | null = null;
  try {
    googleSheetsService = new GoogleSheetsService();
    console.log("✅ 구글 시트 서비스 초기화 성공");
  } catch (error) {
    console.warn("⚠️ 구글 시트 서비스 초기화 실패 (결과 저장 기능 비활성화):", error instanceof Error ? error.message : String(error));
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
        department: z.string().min(1), // 부서명
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
      console.log("📊 분석 결과 저장 시도:", { 
        company: data.company, 
        employeeId: data.employeeId,
        name: data.name, 
        realAge: data.realAge,
        faceAge: data.faceAge,
        ageDifference: data.ageDifference,
        completedAt: data.completedAt,
      });
      
      await googleSheetsService.saveAnalysisResult(data);
      console.log("✅ 구글 시트 저장 성공 - API 응답 완료");

      // SSE로 모든 연결된 클라이언트에게 랭킹 갱신 알림 전송
      broadcastToSSEClients("ranking-updated", {
        message: "랭킹이 업데이트되었습니다",
        timestamp: new Date().toISOString(),
      });
      console.log(`📢 SSE로 랭킹 갱신 알림 전송 (${sseClients.size}개 클라이언트)`);

      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      console.error("❌ 분석 결과 저장 실패 - 라우트 레벨:");
      console.error("에러:", error);
      if (error?.message) {
        console.error("에러 메시지:", error.message);
      }
      res.status(500).json({ 
        error: "결과 저장 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // 랭킹 데이터 조회
  app.get("/api/ranking", async (req, res) => {
    try {
      // 구글 시트 서비스가 초기화되지 않았으면 오류 반환
      if (!googleSheetsService) {
        return res.status(503).json({ error: "구글 시트 서비스가 설정되지 않았습니다." });
      }

      // 구글 시트에서 랭킹 데이터 조회
      const rankingData = await googleSheetsService.getRankingData();
      
      res.json(rankingData);
    } catch (error: any) {
      console.error("❌ 랭킹 데이터 조회 실패:");
      console.error("에러:", error);
      if (error?.message) {
        console.error("에러 메시지:", error.message);
      }
      res.status(500).json({ 
        error: "랭킹 데이터 조회 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // SSE 스트림 엔드포인트 (랭킹 갱신 알림)
  app.get("/api/ranking/stream", (req, res) => {
    // SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Nginx 버퍼링 방지

    // 클라이언트를 목록에 추가
    sseClients.add(res);
    console.log(`📡 SSE 클라이언트 연결됨 (총 ${sseClients.size}개)`);

    // 연결 시작 메시지 전송
    res.write(`event: connected\ndata: ${JSON.stringify({ message: "연결되었습니다" })}\n\n`);

    // 주기적으로 heartbeat 전송 (연결 유지)
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch (error) {
        clearInterval(heartbeatInterval);
        sseClients.delete(res);
      }
    }, 30000); // 30초마다 heartbeat

    // 클라이언트 연결 종료 시 정리
    req.on("close", () => {
      clearInterval(heartbeatInterval);
      sseClients.delete(res);
      console.log(`📡 SSE 클라이언트 연결 해제됨 (총 ${sseClients.size}개)`);
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
