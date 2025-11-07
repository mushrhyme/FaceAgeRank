import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByCompanyAndEmployeeId(company: string, employeeId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
    
    // 임시 사용자 데이터 추가
    const tempUser: User = {
      id: randomUUID(),
      company: "테크 컴퍼니",
      employeeId: "EMP001",
      name: "조유민",
      realAge: 30,
    };
    this.users.set(tempUser.id, tempUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCompanyAndEmployeeId(company: string, employeeId: string): Promise<User | undefined> {
    // 임시로 항상 조유민 정보 반환
    return Array.from(this.users.values()).find(user => user.name === "조유민");
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
