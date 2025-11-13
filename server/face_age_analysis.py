"""
얼굴 나이 분석 서비스
이미지 경로를 받아서 얼굴을 감지하고 나이를 추정합니다.
"""
import cv2
import sys
import json
import os
import numpy as np
from insightface.app import FaceAnalysis
import onnxruntime as ort
from torchvision import transforms
from PIL import Image

# -----------------------------
# 1️⃣ 얼굴 감지 모델 로드 (InsightFace) CPU 전용
# -----------------------------
# InsightFace 초기화 (모델 다운로드 시 stdout에 출력할 수 있음)
# stdout 출력은 TypeScript에서 필터링됨
face_app = FaceAnalysis(name="buffalo_s")
face_app.prepare(ctx_id=-1, det_size=(640, 640))  # CPU 전용 (ctx_id=-1)

# -----------------------------
# 2️⃣ 나이 추정 모델 (ONNX, CPU)
# 모델은 resnet18
# 학습 데이터 : AAF 대략 5천장?(22세~80세)
# 연령별 불균형 약간 있음. 22세 ~50세까진 100장 그 이후론 약간 떨어져서, 결과값이 약간 어리게 나옴
# -----------------------------
# ONNX 모델 경로 결정: 명령줄 인자 > 환경 변수 > 기본값
onnx_model_path = None
if len(sys.argv) >= 2:
    onnx_model_path = sys.argv[1]  # 첫 번째 인자로 ONNX 모델 경로 지정

if not onnx_model_path:
    onnx_model_path = os.getenv("ONNX_MODEL_PATH", "age_estimation.onnx")

# 절대 경로로 변환 (상대 경로인 경우)
if not os.path.isabs(onnx_model_path):
    # 현재 작업 디렉토리 기준으로 절대 경로 생성
    onnx_model_path = os.path.abspath(onnx_model_path)

# ONNX 모델 파일 존재 확인 및 로드 (에러 발생 시 나중에 처리)
onnx_session = None
onnx_load_error = None

if not os.path.exists(onnx_model_path):
    onnx_load_error = f"ONNX 모델 파일을 찾을 수 없습니다: {onnx_model_path}"
else:
    # ONNX 모델 로드
    try:
        onnx_session = ort.InferenceSession(onnx_model_path, providers=["CPUExecutionProvider"])
        print(f"✅ ONNX 모델 로드 성공: {onnx_model_path}", file=sys.stderr)
    except Exception as e:
        onnx_load_error = f"ONNX 모델 로드 실패: {str(e)}"

# 학습 시 사용한 전처리와 동일해야 함
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])


def predict_age_from_array(face_img):
    """
    numpy array(BGR)를 받아서 ONNX로 나이 예측
    
    Args:
        face_img: BGR 형식의 numpy array (얼굴 이미지)
    
    Returns:
        float: 예측된 나이
    """
    if onnx_session is None:
        raise RuntimeError(onnx_load_error or "ONNX 모델이 로드되지 않았습니다.")
    
    # BGR → RGB 변환 및 PIL 이미지 변환
    img = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
    img_tensor = transform(img).unsqueeze(0).numpy()  # (1,3,224,224)

    # ONNX 추론
    pred = onnx_session.run(["age"], {"input": img_tensor})[0]
    return float(pred[0])


def analyze_face_age_from_buffer(image_buffer):
    """
    이미지 버퍼를 받아서 얼굴을 감지하고 나이를 추정합니다.
    
    Args:
        image_buffer: 이미지 바이너리 데이터 (bytes)
    
    Returns:
        dict: {
            "success": bool,
            "age": float (성공 시),
            "error": str (실패 시)
        }
    """
    try:
        # 바이너리 데이터를 numpy array로 변환
        nparr = np.frombuffer(image_buffer, np.uint8)
        # OpenCV로 이미지 디코딩
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {
                "success": False,
                "error": "이미지를 디코딩할 수 없습니다."
            }

        # 얼굴 탐지
        faces = face_app.get(frame)
        if len(faces) == 0:
            return {
                "success": False,
                "error": "얼굴을 감지할 수 없습니다."
            }

        h, w, _ = frame.shape
        # 첫 번째 얼굴만 처리 (여러 얼굴이 있을 경우 첫 번째 얼굴 사용)
        face = faces[0]
        x1, y1, x2, y2 = face.bbox.astype(int)

        # 얼굴 박스 크기 계산
        face_w = x2 - x1
        face_h = y2 - y1

        # 패딩 비율 설정 (위쪽은 좀 더 크게)
        # 학습데이터에 옷이랑 머리 약간나와서 얼굴인식할때 여유있게 잘라야함
        # 패딩 지우면 결과 너무 달라짐
        pad_x = int(face_w * 0.2)
        pad_y_top = int(face_h * 0.15)
        pad_y_bottom = int(face_h * 0.15)

        # 패딩 적용 (머리 포함)
        x1 = max(0, x1 - pad_x)
        y1 = max(0, y1 - pad_y_top)
        x2 = min(w, x2 + pad_x)
        y2 = min(h, y2 + pad_y_bottom)

        # 얼굴+머리 crop
        face_img = frame[y1:y2, x1:x2]
        if face_img.size == 0:
            return {
                "success": False,
                "error": "얼굴 영역을 추출할 수 없습니다."
            }

        # ONNX 나이 예측
        age = predict_age_from_array(face_img)

        # 약간 보정
        adjusted_age = round(age * 1.001)

        return {
            "success": True,
            "age": adjusted_age
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    # stdin에서 이미지 데이터 읽기 (바이너리 모드)
    import time
    
    try:
        # 분석 시작 시간 측정
        start_time = time.time()
        
        # ONNX 모델 로드 에러 확인
        if onnx_load_error:
            # 모델 로드 실패 시에도 stdin을 읽어서 EPIPE 방지
            image_buffer = sys.stdin.buffer.read()
            result = {
                "success": False,
                "error": onnx_load_error
            }
        else:
            # stdin에서 모든 데이터 읽기
            image_buffer = sys.stdin.buffer.read()
            
            if len(image_buffer) == 0:
                result = {
                    "success": False,
                    "error": "이미지 데이터가 필요합니다."
                }
            else:
                result = analyze_face_age_from_buffer(image_buffer)
                
                # 분석 시간 추가
                analysis_time = time.time() - start_time
                if result.get("success"):
                    result["analysis_time"] = round(analysis_time, 2)  # 소수점 둘째 자리까지
                
    except Exception as e:
        result = {
            "success": False,
            "error": f"이미지 처리 중 오류 발생: {str(e)}"
        }

    # JSON으로 결과 출력
    # InsightFace가 stdout에 출력할 수 있으므로, TypeScript에서 마지막 JSON 라인을 추출함
    print(json.dumps(result, ensure_ascii=False))

