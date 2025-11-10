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
