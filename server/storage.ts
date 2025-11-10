import { type User } from "@shared/schema";
import { randomUUID } from "crypto";
import XLSX from "xlsx";
import { existsSync } from "fs";
import { join } from "path";

export interface IStorage {
  getUserByCompanyAndEmployeeId(company: string, employeeId: string): Promise<User | undefined>;
}

/**
 * 생년월일 문자열에서 나이 계산
 * @param birthDate 생년월일 (YYYY-MM-DD 형식)
 * @returns 나이 (정수)
 */
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
}

  return age;
}

/**
 * 엑셀 파일에서 직원 정보를 읽어오는 스토리지
 */
export class ExcelStorage implements IStorage {
  private workbook!: XLSX.WorkBook; // loadWorkbook()에서 초기화됨
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || join(process.cwd(), "data", "employees.xlsx");
    this.loadWorkbook();
  }

  private loadWorkbook() {
    if (!existsSync(this.filePath)) {
      throw new Error(`엑셀 파일을 찾을 수 없습니다: ${this.filePath}`);
    }
    
    try {
      this.workbook = XLSX.readFile(this.filePath);
      console.log(`✅ 엑셀 파일 로드 성공: ${this.filePath}`);
    } catch (error) {
      throw new Error(`엑셀 파일 로드 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 값을 문자열로 안전하게 변환 (숫자, 날짜 등 모든 타입 처리)
   * 엑셀에서 숫자를 읽을 때 천 단위 구분 기호(쉼표)가 포함될 수 있으므로 제거
   */
  private safeString(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }
    // 숫자로 읽힌 경우도 문자열로 변환하고, 천 단위 구분 기호(쉼표) 제거
    return String(value).trim().replace(/,/g, "");
  }

  /**
   * 엑셀 데이터를 User 객체로 변환
   */
  private excelRowToUser(row: any, id: string): User | undefined {
    try {
      const company = this.safeString(row["회사"]);
      // 사번은 문자와 숫자가 섞일 수 있으므로 무조건 문자열로 처리
      const employeeId = this.safeString(row["사번"]);
      const name = this.safeString(row["이름"]);
      // 생년월일: 8자리 숫자 형식(19970919) 필수
      let birthDateStr = this.safeString(row["생년월일"]);
      const department = this.safeString(row["부서"]);

      if (!company || !employeeId || !name || !birthDateStr || !department) {
        return undefined;
      }

      // 생년월일이 8자리 숫자 형식(19970919)인 경우 YYYY-MM-DD로 변환
      if (/^\d{8}$/.test(birthDateStr)) {
        const year = birthDateStr.substring(0, 4);
        const month = birthDateStr.substring(4, 6);
        const day = birthDateStr.substring(6, 8);
        birthDateStr = `${year}-${month}-${day}`;
      } else {
        // 8자리 형식이 아니면 에러 로그 출력
        console.warn(`⚠️ 생년월일 형식 오류: ${birthDateStr} (8자리 숫자 형식이어야 함)`);
        return undefined;
      }

      // 만 나이 계산 (오늘 날짜 기준)
      const realAge = calculateAge(birthDateStr);

      return {
        id,
        company,
        employeeId,
        name,
        realAge,
        department,
      };
    } catch (error) {
      console.error("❌ 엑셀 행 변환 실패:", error);
      return undefined;
    }
  }

  async getUserByCompanyAndEmployeeId(company: string, employeeId: string): Promise<User | undefined> {
    const sheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    // 모든 값을 문자열로 읽기 위해 raw 옵션 사용
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const searchCompany = company.trim();
    const searchEmployeeId = employeeId.trim();

    for (const row of data) {
      // 사번은 문자와 숫자가 섞일 수 있으므로 무조건 문자열로 처리
      const rowData = row as Record<string, any>;
      const rowCompany = this.safeString(rowData["회사"]);
      const rowEmployeeId = this.safeString(rowData["사번"]);

      if (rowCompany === searchCompany && rowEmployeeId === searchEmployeeId) {
        const userId = randomUUID(); // 엑셀에는 ID가 없으므로 생성
        return this.excelRowToUser(rowData, userId);
      }
    }

    return undefined;
  }
}

/**
 * 엑셀 파일 스토리지 생성
 */
function createStorage(): IStorage {
  const excelPath = process.env.EXCEL_FILE_PATH;
  return new ExcelStorage(excelPath);
}

export const storage = createStorage();

