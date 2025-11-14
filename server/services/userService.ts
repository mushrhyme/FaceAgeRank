/**
 * 사용자 서비스
 * 사용자 조회 로직 처리
 */

import type { IStorage } from "../storage";
import type { User } from "../../shared/schema";

export class UserService {
  constructor(private storage: IStorage) {}

  /**
   * 회사명과 사번으로 사용자 조회
   * @param company 회사명
   * @param employeeId 사번
   * @returns 사용자 정보 또는 undefined
   */
  async getUserByCompanyAndEmployeeId(company: string, employeeId: string): Promise<User | undefined> {
    return await this.storage.getUserByCompanyAndEmployeeId(company, employeeId);
  }
}

