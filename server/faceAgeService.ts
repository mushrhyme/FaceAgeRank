/**
 * 얼굴 나이 분석 서비스
 * 
 * 로컬 모델 또는 원격 API를 통해 얼굴 나이를 분석합니다.
 * 환경 변수에 따라 동작 방식이 결정됩니다.
 */

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
 * (나중에 실제 모델 연동 시 구현)
 */
export class LocalFaceAgeService implements FaceAgeService {
  constructor(private modelPath?: string) {
    // TODO: 모델 초기화
    console.log("📦 로컬 얼굴 인식 모델 서비스 초기화");
  }

  async predictAge(imageBuffer: Buffer): Promise<number> {
    // TODO: 실제 모델 예측 로직 구현
    // 예시:
    // const model = await loadModel(this.modelPath);
    // const age = await model.predict(imageBuffer);
    // return Math.round(age);
    
    // 임시: 랜덤 값 반환
    return Math.floor(Math.random() * 30) + 20; // 20-49 사이 랜덤
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

