/**
 * 얼굴 나이 분석 서비스
 * 
 * 로컬 ONNX 모델을 사용하여 얼굴 나이를 분석합니다.
 */

import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface FaceAgeService {
  /**
   * 이미지 버퍼를 받아서 얼굴 나이를 반환합니다.
   * @param imageBuffer 이미지 바이너리 데이터
   * @returns 얼굴 나이와 분석 시간
   */
  predictAge(imageBuffer: Buffer): Promise<number | { age: number; analysisTime?: number }>;
}

/**
 * 로컬 모델을 사용하는 얼굴 나이 분석 서비스
 * Python 스크립트를 사용하여 얼굴 나이를 분석합니다.
 */
export class LocalFaceAgeService implements FaceAgeService {
  private pythonScriptPath: string;
  private onnxModelPath: string;

  constructor(modelPath?: string) {
    // 프로젝트 루트 경로 (프로덕션 빌드에서는 dist/ 디렉토리이므로 상위로 이동)
    // 개발 모드: __dirname = server/
    // 프로덕션: __dirname = dist/ (빌드된 파일 위치)
    const isProduction = process.env.NODE_ENV === "production";
    const projectRoot = isProduction 
      ? join(process.cwd()) // 프로덕션에서는 process.cwd()가 프로젝트 루트
      : join(__dirname, ".."); // 개발 모드에서는 상위 디렉토리
    
    // Python 스크립트 경로 설정 (항상 server/ 디렉토리에서 찾음)
    this.pythonScriptPath = join(projectRoot, "server", "face_age_analysis.py");
    // ONNX 모델 경로 설정 (프로젝트 루트 또는 환경 변수)
    this.onnxModelPath = modelPath || join(projectRoot, "age_estimation.onnx");
  }

  /**
   * 이미지 버퍼를 stdin으로 전달하여 Python 스크립트를 실행하고 나이를 분석합니다.
   * 파일 저장 없이 메모리에서 직접 처리하여 성능을 최적화합니다.
   * @param imageBuffer 이미지 바이너리 데이터
   * @returns 얼굴 나이와 분석 시간
   */
  async predictAge(imageBuffer: Buffer): Promise<number | { age: number; analysisTime?: number }> {
    const processStartTime = Date.now();
    return new Promise<number | { age: number; analysisTime?: number }>((resolve, reject) => {
      // 프로젝트 루트 경로 (프로덕션 빌드에서는 dist/ 디렉토리이므로 상위로 이동)
      const isProduction = process.env.NODE_ENV === "production";
      const projectRoot = isProduction 
        ? process.cwd() // 프로덕션에서는 process.cwd()가 프로젝트 루트
        : join(__dirname, ".."); // 개발 모드에서는 상위 디렉토리
      
      // Python 스크립트 실행 (stdin으로 이미지 데이터 전달)
      // ONNX 모델 경로를 명령줄 인자로 전달
      // conda 환경의 python 사용 (환경 변수에서 확인, 없으면 기본 경로 사용)
      const pythonCommand = process.env.PYTHON_PATH || "/opt/anaconda3/envs/easy_label/bin/python";
      const pythonArgs = [this.pythonScriptPath, this.onnxModelPath];
      
      const spawnStartTime = Date.now();
      const pythonProcess = spawn(
        pythonCommand,
        pythonArgs,
        {
          cwd: projectRoot, // ONNX 모델을 찾을 수 있도록 작업 디렉토리 설정
          stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr 모두 파이프
          shell: false, // shell 사용 안 함
        }
      );
      const spawnTime = Date.now() - spawnStartTime;
      
      let stdout = "";
      let stderr = "";
      let stdinWriteTime = 0;

      // stdout 수집
      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      // stderr 수집
      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      // 프로세스 종료 처리
      pythonProcess.on("close", (code) => {
        const processEndTime = Date.now();
        const totalProcessTime = (processEndTime - processStartTime) / 1000;
        
        if (code !== 0) {
          console.error("❌ Python 스크립트 실행 실패:", stderr || "알 수 없는 오류");
          reject(new Error(`Python 스크립트가 종료 코드 ${code}로 종료되었습니다: ${stderr || "알 수 없는 오류"}`));
          return;
        }

        try {
          // stdout 확인
          if (!stdout.trim()) {
            console.error("❌ Python 스크립트가 출력을 반환하지 않았습니다");
            reject(new Error("Python 스크립트가 결과를 반환하지 않았습니다."));
            return;
          }

          // stdout에서 JSON만 추출 (마지막 줄이 JSON일 것으로 예상)
          // InsightFace가 stdout에 출력을 보낼 수 있으므로 마지막 유효한 JSON 라인 찾기
          const lines = stdout.trim().split('\n');
          let jsonLine = "";
          
          // 뒤에서부터 JSON 형식인 라인 찾기
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              jsonLine = line;
              break;
            }
          }
          
          if (!jsonLine) {
            // JSON을 찾지 못한 경우 전체 stdout을 시도
            jsonLine = stdout.trim();
          }

          // JSON 결과 파싱
          const result = JSON.parse(jsonLine);
          
          if (!result.success) {
            reject(new Error(result.error || "얼굴 나이 분석에 실패했습니다."));
            return;
          }

          // 오버헤드 분석 (디버깅용)
          const modelTime = result.analysis_time || 0;
          const overhead = totalProcessTime - modelTime;
          
          // stderr에서 타이밍 정보 추출
          const timingInfo: Record<string, number> = {};
          
          // import 시간
          const importMatch = stderr.match(/\[타이밍\] import: ([\d.]+)초/);
          if (importMatch) timingInfo.import = parseFloat(importMatch[1]);
          
          // 모델 로드 시간들
          const modelLoadMatch = stderr.match(/\[타이밍\].*?모델 로드 전체: ([\d.]+)초/);
          if (modelLoadMatch) timingInfo.modelLoad = parseFloat(modelLoadMatch[1]);
          
          // stdin 읽기 시간
          const stdinReadMatch = stderr.match(/\[타이밍\].*?stdin 읽기: ([\d.]+)초/);
          if (stdinReadMatch) timingInfo.stdinRead = parseFloat(stdinReadMatch[1]);
          
          // 이미지 디코딩 시간
          const decodeMatch = stderr.match(/\[타이밍\].*?이미지 디코딩: ([\d.]+)초/);
          if (decodeMatch) timingInfo.decode = parseFloat(decodeMatch[1]);
          
          // 스크립트 전체 시간
          const scriptTotalMatch = stderr.match(/\[타이밍\].*?스크립트 전체: ([\d.]+)초/);
          if (scriptTotalMatch) timingInfo.scriptTotal = parseFloat(scriptTotalMatch[1]);
          
          // 상세 타이밍 로그
          const timingParts = [
            `프로세스 시작: ${(spawnTime / 1000).toFixed(3)}초`,
            timingInfo.import ? `import: ${timingInfo.import.toFixed(2)}초` : null,
            timingInfo.modelLoad ? `모델 로드: ${timingInfo.modelLoad.toFixed(2)}초` : null,
            `stdin 쓰기: ${(stdinWriteTime / 1000).toFixed(3)}초`,
            timingInfo.stdinRead ? `stdin 읽기: ${timingInfo.stdinRead.toFixed(3)}초` : null,
            timingInfo.decode ? `이미지 디코딩: ${timingInfo.decode.toFixed(3)}초` : null,
            `모델 러닝: ${modelTime.toFixed(3)}초`,
            `전체 프로세스: ${totalProcessTime.toFixed(2)}초`,
            `오버헤드: ${overhead.toFixed(2)}초`
          ].filter(Boolean);
          
          // 디버그 로그는 프로덕션에서 제거됨

          // 나이와 분석 시간 반환
          resolve({
            age: Math.round(result.age),
            analysisTime: result.analysis_time || undefined
          });
        } catch (error: any) {
          console.error("❌ 결과 파싱 실패:", error.message);
          reject(new Error(`결과 파싱 실패: ${error.message}`));
        }
      });

      // 에러 처리
      pythonProcess.on("error", (error: any) => {
        if (error.code === "ENOENT") {
          reject(new Error(`Python 실행 파일을 찾을 수 없습니다. (${pythonCommand}) PYTHON_PATH 환경 변수를 설정하거나 conda가 설치되어 있는지 확인하세요.`));
        } else {
          reject(new Error(`Python 스크립트 실행 중 오류: ${error.message}`));
        }
      });

      // stdin 에러 처리 (EPIPE 방지)
      pythonProcess.stdin.on("error", (error: any) => {
        // EPIPE는 프로세스가 종료된 후 쓰기 시도할 때 발생 (정상적인 경우도 있음)
        if (error.code !== "EPIPE") {
          console.error("❌ stdin 쓰기 에러:", error);
        }
      });

      // 이미지 데이터를 stdin으로 전송
      try {
        if (!pythonProcess.killed && pythonProcess.stdin && !pythonProcess.stdin.destroyed) {
          const stdinStartTime = Date.now();
          pythonProcess.stdin.write(imageBuffer);
          pythonProcess.stdin.end();
          stdinWriteTime = Date.now() - stdinStartTime;
        } else {
          reject(new Error("Python 프로세스가 종료되었습니다. 모델 로드에 실패했을 수 있습니다."));
        }
      } catch (error: any) {
        if (error.code !== "EPIPE") {
          reject(new Error(`이미지 데이터 전송 실패: ${error.message}`));
        }
      }
    });
  }
}

/**
 * 얼굴 나이 분석 서비스 팩토리
 * 로컬 ONNX 모델을 사용하는 서비스를 생성합니다.
 */
export function createFaceAgeService(): FaceAgeService {
  const modelPath = process.env.FACE_AGE_MODEL_PATH;
  return new LocalFaceAgeService(modelPath);
}

