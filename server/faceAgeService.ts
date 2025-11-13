/**
 * 얼굴 나이 분석 서비스
 * 
 * 로컬 모델 또는 원격 API를 통해 얼굴 나이를 분석합니다.
 * 환경 변수에 따라 동작 방식이 결정됩니다.
 */

import { spawn } from "child_process";
import { join } from "path";

export interface FaceAgeService {
  /**
   * 이미지 버퍼를 받아서 얼굴 나이를 반환합니다.
   * @param imageBuffer 이미지 바이너리 데이터
   * @returns 얼굴 나이 (정수)
   */
  predictAge(imageBuffer: Buffer): Promise<number>;
}

/**
 * 로컬 모델을 사용하는 얼굴 나이 분석 서비스
 * Python 스크립트를 사용하여 얼굴 나이를 분석합니다.
 */
export class LocalFaceAgeService implements FaceAgeService {
  private pythonScriptPath: string;
  private onnxModelPath: string;

  constructor(modelPath?: string) {
    // Python 스크립트 경로 설정
    this.pythonScriptPath = join(import.meta.dirname, "face_age_analysis.py");
    // ONNX 모델 경로 설정 (프로젝트 루트 또는 환경 변수)
    this.onnxModelPath = modelPath || join(import.meta.dirname, "..", "age_estimation.onnx");
    
    console.log("📦 로컬 얼굴 인식 모델 서비스 초기화");
    console.log(`   Python 스크립트: ${this.pythonScriptPath}`);
    console.log(`   ONNX 모델: ${this.onnxModelPath}`);
  }

  /**
   * 이미지 버퍼를 stdin으로 전달하여 Python 스크립트를 실행하고 나이를 분석합니다.
   * 파일 저장 없이 메모리에서 직접 처리하여 성능을 최적화합니다.
   * @param imageBuffer 이미지 바이너리 데이터
   * @returns 얼굴 나이 (정수)
   */
  async predictAge(imageBuffer: Buffer): Promise<number> {
    console.log("🔍 얼굴 나이 분석 시작 (Python 스크립트 실행)");
    console.log(`   스크립트: ${this.pythonScriptPath}`);
    console.log(`   ONNX 모델: ${this.onnxModelPath}`);
    
    return new Promise((resolve, reject) => {
      const projectRoot = join(import.meta.dirname, "..");
      
      // Python 스크립트 실행 (stdin으로 이미지 데이터 전달)
      // ONNX 모델 경로를 명령줄 인자로 전달
      // conda 환경의 python 사용 (환경 변수에서 확인, 없으면 기본 경로 사용)
      const pythonCommand = process.env.PYTHON_PATH || "/opt/anaconda3/envs/easy_label/bin/python";
      const pythonArgs = [this.pythonScriptPath, this.onnxModelPath];
      
      const pythonProcess = spawn(
        pythonCommand,
        pythonArgs,
        {
          cwd: projectRoot, // ONNX 모델을 찾을 수 있도록 작업 디렉토리 설정
          stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr 모두 파이프
          shell: false, // shell 사용 안 함
        }
      );
      
      console.log(`   Python 프로세스 시작: ${pythonCommand} ${this.pythonScriptPath} ${this.onnxModelPath}`);

      let stdout = "";
      let stderr = "";

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
        console.log(`   Python 프로세스 종료 코드: ${code}`);
        
        if (code !== 0) {
          console.error("❌ Python 스크립트 실행 실패");
          console.error("   종료 코드:", code);
          console.error("   stderr:", stderr);
          console.error("   stdout:", stdout);
          reject(new Error(`Python 스크립트가 종료 코드 ${code}로 종료되었습니다: ${stderr || "알 수 없는 오류"}`));
          return;
        }

        try {
          // stderr에 로그가 있으면 출력 (ONNX 모델 로드 확인 등)
          if (stderr.trim()) {
            console.log("📝 Python 스크립트 로그 (stderr):");
            console.log(stderr.trim().split('\n').map(line => `   ${line}`).join('\n'));
          }

          // stdout 확인
          if (!stdout.trim()) {
            console.error("❌ Python 스크립트가 출력을 반환하지 않았습니다");
            console.error("   stderr:", stderr);
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
            // 얼굴을 감지하지 못한 경우는 정상적인 상황일 수 있음
            if (result.error && result.error.includes("얼굴을 감지할 수 없습니다")) {
              console.warn("⚠️ 얼굴을 감지하지 못했습니다:", result.error);
            } else {
              console.error("❌ Python 스크립트 분석 실패:", result.error);
            }
            reject(new Error(result.error || "얼굴 나이 분석에 실패했습니다."));
            return;
          }

          // 분석 시간 로그 출력
          if (result.analysis_time) {
            console.log(`⏱️  얼굴 나이 분석 완료: ${result.age}세 (소요 시간: ${result.analysis_time}초)`);
          } else {
            console.log(`✅ 얼굴 나이 분석 완료: ${result.age}세`);
          }

          // 나이 반환 (정수로 반올림)
          resolve(Math.round(result.age));
        } catch (error: any) {
          console.error("❌ 결과 파싱 실패");
          console.error("   stdout:", stdout);
          console.error("   stderr:", stderr);
          console.error("   에러:", error);
          reject(new Error(`결과 파싱 실패: ${error.message}`));
        }
      });

      // 에러 처리
      pythonProcess.on("error", (error: any) => {
        console.error("❌ Python 프로세스 에러:", error);
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

      // 프로세스가 종료되기 전에 stdin에 쓰기
      // 모델 로드가 완료될 때까지 기다리기 위해 약간의 지연 후 전송
      // 하지만 더 나은 방법은 Python 스크립트가 준비되었다는 신호를 받는 것
      setTimeout(() => {
        if (!pythonProcess.killed && pythonProcess.stdin && !pythonProcess.stdin.destroyed) {
          try {
            pythonProcess.stdin.write(imageBuffer);
            pythonProcess.stdin.end();
          } catch (error: any) {
            if (error.code !== "EPIPE") {
              console.error("❌ stdin 쓰기 실패:", error);
              reject(new Error(`이미지 데이터 전송 실패: ${error.message}`));
            }
          }
        } else {
          reject(new Error("Python 프로세스가 종료되었습니다. 모델 로드에 실패했을 수 있습니다."));
        }
      }, 100); // 100ms 대기 (모델 로드 시간 확보)
    });
  }
}

/**
 * 원격 API를 사용하는 얼굴 나이 분석 서비스
 */
export class RemoteFaceAgeService implements FaceAgeService {
  constructor(
    private apiUrl: string,
    private apiKey?: string
  ) {
    console.log(`🌐 원격 얼굴 인식 API 서비스 초기화: ${apiUrl}`);
  }

  async predictAge(imageBuffer: Buffer): Promise<number> {
    try {
      // TODO: 실제 API 호출 로직 구현
      // 예시:
      // const formData = new FormData();
      // formData.append('image', imageBuffer, 'face.jpg');
      // const response = await fetch(this.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      //   body: formData,
      // });
      // const result = await response.json();
      // return result.age;
      
      // 임시: 랜덤 값 반환
      return Math.floor(Math.random() * 30) + 20; // 20-49 사이 랜덤
    } catch (error) {
      console.error("❌ 원격 API 호출 실패:", error);
      throw new Error("얼굴 나이 분석에 실패했습니다.");
    }
  }
}

/**
 * 얼굴 나이 분석 서비스 팩토리
 * 환경 변수에 따라 적절한 서비스를 생성합니다.
 */
export function createFaceAgeService(): FaceAgeService | null {
  const mode = process.env.FACE_AGE_MODE || "local"; // "local" | "remote" | "none"
  
  if (mode === "none") {
    console.log("⚠️ 얼굴 인식 서비스 비활성화됨");
    return null;
  }

  if (mode === "remote") {
    const apiUrl = process.env.FACE_AGE_API_URL;
    if (!apiUrl) {
      console.warn("⚠️ FACE_AGE_API_URL이 설정되지 않아 로컬 모드로 전환");
      return new LocalFaceAgeService();
    }
    const apiKey = process.env.FACE_AGE_API_KEY;
    return new RemoteFaceAgeService(apiUrl, apiKey);
  }

  // 기본값: 로컬 모드
  const modelPath = process.env.FACE_AGE_MODEL_PATH;
  return new LocalFaceAgeService(modelPath);
}

