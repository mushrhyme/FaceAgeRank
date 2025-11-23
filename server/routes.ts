import type { Express } from "express";
import { createServer, type Server } from "http";
import { createServer as createHttpsServer, type Server as HttpsServer } from "https";
import { readFileSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { GoogleSheetsService } from "./googleSheets";
import { createFaceAgeService } from "./faceAgeService";
import { analysisResultSchema } from "../shared/schema";
import { getErrorMessage } from "../shared/utils";
import { sseService } from "./services/sseService";
import { AnalysisService } from "./services/analysisService";
import { RankingService } from "./services/rankingService";
import { UserService } from "./services/userService";

export async function registerRoutes(app: Express): Promise<Server | HttpsServer> {
  // 구글 시트 서비스 초기화 (환경 변수가 없으면 null)
  let googleSheetsService: GoogleSheetsService | null = null;
  try {
    googleSheetsService = new GoogleSheetsService();
  } catch (error) {
    console.warn("⚠️ 구글 시트 서비스 초기화 실패 (결과 저장 기능 비활성화):", getErrorMessage(error));
  }

  // 얼굴 나이 분석 서비스 초기화
  const faceAgeService = createFaceAgeService();

  // 서비스 레이어 초기화
  const analysisService = new AnalysisService(faceAgeService, googleSheetsService);
  const rankingService = new RankingService(googleSheetsService);
  const userService = new UserService(storage);

  // 얼굴 나이 분석 API (Base64 이미지)
  // POST /api/analysis/face-age (JSON body: { image: "data:image/jpeg;base64,..." })
  app.post("/api/analysis/face-age", async (req, res) => {
    const totalStartTime = Date.now();
    try {
      // Base64 이미지 처리
      if (!req.body.image) {
        return res.status(400).json({ error: "이미지 데이터가 필요합니다." });
      }

      const serviceStartTime = Date.now();
      // 얼굴 나이 분석
      const result = await analysisService.analyzeFaceAgeFromBase64(req.body.image);
      const serviceTime = Date.now() - serviceStartTime;
      
      // result가 객체인 경우 (분석 시간 포함) 또는 숫자인 경우 (나이만)
      if (typeof result === "object" && result !== null && "age" in result) {
        const faceAge = result.age;
        const analysisTime = result.analysisTime;
        const totalTime = Date.now() - totalStartTime;
        
        // 오버헤드 분석
        if (analysisTime) {
          const overhead = (totalTime / 1000) - analysisTime;
          console.log(`   → 모델 러닝 타임: ${analysisTime}초 | 서비스 레이어: ${(serviceTime / 1000).toFixed(2)}초 | 전체: ${(totalTime / 1000).toFixed(2)}초 | 오버헤드: ${overhead.toFixed(2)}초`);
        }
        
        res.json({ faceAge, analysisTime });
      } else {
        res.json({ faceAge: result });
      }
    } catch (error: any) {
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

  // 키인 모드: 클라이언트에서 직접 User 객체를 생성하므로 서버 엔드포인트 불필요

  // 분석 결과 저장
  app.post("/api/analysis/save", async (req, res) => {
    try {
      const data = analysisResultSchema.parse(req.body);

      // 분석 결과 저장 (서비스에서 SSE 브로드캐스트도 처리)
      await analysisService.saveAnalysisResult(data);

      // 사용자 정보와 나이만 로깅
      console.log(`${data.name} (${data.company}/${data.employeeId}) - 분석 나이: ${data.faceAge}세`);

      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
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

  // 이미지 메타데이터 인터페이스
  interface ImageMetadata {
    imageId: string;
    token: string;
    expiresAt: number; // 만료 시간 (밀리초)
    format: string; // "jpeg" 또는 "png"
    buffer: Buffer; // 이미지 데이터 (메모리에만 저장)
  }

  // 이미지 저장소 (메모리 전용)
  const imageStore = new Map<string, ImageMetadata>();

  // 만료된 이미지 삭제 함수
  const deleteExpiredImages = () => {
    const now = Date.now();
    const expiredImages: string[] = [];

    for (const [imageId, metadata] of imageStore.entries()) {
      if (now >= metadata.expiresAt) {
        expiredImages.push(imageId);
      }
    }

    for (const imageId of expiredImages) {
      imageStore.delete(imageId);
      console.log(`🗑️ 만료된 이미지 삭제 (메모리): ${imageId}`);
    }
  };

  // 30초마다 만료된 이미지 정리
  setInterval(deleteExpiredImages, 30000);

  // 이미지 업로드 API (Base64 이미지를 메모리에만 저장)
  app.post("/api/image/upload", async (req, res) => {
    try {
      if (!req.body.image) {
        return res.status(400).json({ error: "이미지 데이터가 필요합니다." });
      }

      // Base64 이미지 파싱
      const base64Data = req.body.image;
      const base64String = base64Data.includes(",") 
        ? base64Data.split(",")[1] 
        : base64Data;
      
      // 이미지 형식 확인 (jpeg 또는 png)
      const imageFormat = base64Data.includes("data:image/png") ? "png" : "jpeg";
      
      // 고유 ID 및 토큰 생성
      const imageId = randomUUID();
      const token = randomUUID(); // 접근 토큰

      // 이미지를 Buffer로 변환 (메모리에만 저장)
      const imageBuffer = Buffer.from(base64String, "base64");

      // 메타데이터 저장 (1분 후 만료)
      const expiresAt = Date.now() + 60 * 1000; // 1분 = 60,000ms
      imageStore.set(imageId, {
        imageId,
        token,
        expiresAt,
        format: imageFormat,
        buffer: imageBuffer, // 메모리에만 저장
      });

      // 이미지 URL 반환 (토큰 포함)
      const imageUrl = `/api/image/${imageId}?token=${token}`;
      res.json({ imageId, imageUrl, token });
    } catch (error: any) {
      console.error("❌ 이미지 업로드 실패:", error);
      res.status(500).json({ 
        error: error?.message || "이미지 업로드 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // 이미지 조회 API (토큰 검증, 메모리에서 직접 제공)
  app.get("/api/image/:imageId", (req, res) => {
    try {
      const { imageId } = req.params;
      const token = req.query.token as string;

      // 메타데이터 확인
      const metadata = imageStore.get(imageId);
      if (!metadata) {
        return res.status(404).json({ error: "이미지를 찾을 수 없습니다." });
      }

      // 토큰 검증
      if (token !== metadata.token) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }

      // 만료 시간 확인
      if (Date.now() >= metadata.expiresAt) {
        // 만료된 이미지 삭제 (메모리에서)
        imageStore.delete(imageId);
        return res.status(410).json({ error: "이미지가 만료되었습니다." });
      }

      // 메모리에서 이미지 데이터 직접 제공
      const contentType = metadata.format === "png" ? "image/png" : "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // 캐시 방지
      res.send(metadata.buffer);
    } catch (error: any) {
      console.error("❌ 이미지 조회 실패:", error);
      res.status(500).json({ 
        error: error?.message || "이미지 조회 중 오류가 발생했습니다.",
        details: error?.message || String(error)
      });
    }
  });

  // HTTPS 인증서 파일 경로
  const certPath = resolve(import.meta.dirname, "..", "localhost+3.pem");
  const keyPath = resolve(import.meta.dirname, "..", "localhost+3-key.pem");

  // HTTPS 인증서 파일이 존재하면 HTTPS 서버 생성, 없으면 HTTP 서버 생성
  let server: Server | HttpsServer;
  try {
    const cert = readFileSync(certPath);
    const key = readFileSync(keyPath);
    server = createHttpsServer({ cert, key }, app);
  } catch (error) {
    // 인증서 파일이 없으면 HTTP 서버 사용
    server = createServer(app);
  }

  return server;
}
