import { z } from "zod";

// 사용자 스키마 정의
export const userSchema = z.object({
  id: z.string(),
  company: z.string(),
  employeeId: z.string(),
  name: z.string(),
  realAge: z.number().int().positive(),
  department: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// 분석 결과 스키마 정의
export const analysisResultSchema = z.object({
  company: z.string().min(1),
  employeeId: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1),
  realAge: z.number().int().positive(),
  faceAge: z.number().int().positive(),
  ageDifference: z.number().int(),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/), // YYYY-MM-DD HH:MM:SS 형식
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// 랭킹 데이터 스키마 정의
export const rankingDataSchema = z.object({
  company: z.string(),
  employeeId: z.string(),
  name: z.string(),
  department: z.string(),
  realAge: z.number().int().positive(),
  faceAge: z.number().int().positive(),
  ageDifference: z.number().int(),
  completedAt: z.string(),
});

export type RankingData = z.infer<typeof rankingDataSchema>;
