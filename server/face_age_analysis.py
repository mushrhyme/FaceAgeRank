"""
얼굴 나이 분석 서비스
이미지 경로를 받아서 얼굴을 감지하고 나이를 추정합니다.
"""
import sys
import time

# 스크립트 시작 시간 (가장 먼저 측정)
script_start_time = time.time()

import warnings
import os

# 모든 경고 억제 (라이브러리 업데이트 경고 등)
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Albumentations 업데이트 체크 비활성화
os.environ["NO_ALBUMENTATIONS_UPDATE"] = "1"

# import 시작 시간
import_start_time = time.time()

import cv2
import json
import numpy as np
from insightface.app import FaceAnalysis
import onnxruntime as ort
from torchvision import transforms
from PIL import Image

# import 완료 시간
import_end_time = time.time()
import_time = import_end_time - import_start_time

# 모델 로드 시간 측정
model_load_start = time.time()

# -----------------------------
# 1️⃣ 얼굴 감지 모델 로드 (InsightFace) CPU 전용
# -----------------------------
# InsightFace 초기화 (모델 다운로드 시 stdout에 출력할 수 있음)
# stdout 출력은 TypeScript에서 필터링됨
insightface_load_start = time.time()
face_app = FaceAnalysis(name="buffalo_s")
face_app.prepare(ctx_id=-1, det_size=(640, 640))  # CPU 전용 (ctx_id=-1)
insightface_load_time = time.time() - insightface_load_start

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
onnx_load_time = 0

if not os.path.exists(onnx_model_path):
    onnx_load_error = f"ONNX 모델 파일을 찾을 수 없습니다: {onnx_model_path}"
else:
    # ONNX 모델 로드
    try:
        onnx_load_start = time.time()
        onnx_session = ort.InferenceSession(onnx_model_path, providers=["CPUExecutionProvider"])
        onnx_load_time = time.time() - onnx_load_start
        print(f"✅ ONNX 모델 로드 성공: {onnx_model_path}", file=sys.stderr)
    except Exception as e:
        onnx_load_error = f"ONNX 모델 로드 실패: {str(e)}"

model_load_time = time.time() - model_load_start
# 모델 로드 시간을 stderr에 출력 (디버깅용)
print(f"[타이밍] import: {import_time:.2f}초 | InsightFace 로드: {insightface_load_time:.2f}초 | ONNX 로드: {onnx_load_time:.2f}초 | 모델 로드 전체: {model_load_time:.2f}초", file=sys.stderr)

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
            "error": str (실패 시),
            "analysis_time": float (성공 시, 실제 모델 러닝 타임)
        }
    """
    import time
    
    decode_start_time = time.time()
    try:
        # 바이너리 데이터를 numpy array로 변환
        nparr = np.frombuffer(image_buffer, np.uint8)
        # OpenCV로 이미지 디코딩
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        decode_time = time.time() - decode_start_time
        
        if frame is None:
            return {
                "success": False,
                "error": "이미지를 디코딩할 수 없습니다."
            }

        # 실제 모델 러닝 타임 측정 시작 (얼굴 감지부터)
        model_start_time = time.time()

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

        # 실제 모델 러닝 타임 측정 종료 (얼굴 감지 ~ 나이 추정 완료)
        model_time = time.time() - model_start_time
        
        # 디버깅용 타이밍 정보 출력
        print(f"[타이밍] 이미지 디코딩: {decode_time:.3f}초 | 모델 러닝: {model_time:.3f}초", file=sys.stderr)

        return {
            "success": True,
            "age": round(age),  # 반올림만 수행
            "analysis_time": round(model_time, 2)  # 실제 모델 러닝 타임 (소수점 둘째 자리)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    # stdin에서 이미지 데이터 읽기 (바이너리 모드)
    stdin_read_start = time.time()
    try:
        # ONNX 모델 로드 에러 확인
        if onnx_load_error:
            # 모델 로드 실패 시에도 stdin을 읽어서 EPIPE 방지
            image_buffer = sys.stdin.buffer.read()
            stdin_read_time = time.time() - stdin_read_start
            result = {
                "success": False,
                "error": onnx_load_error
            }
        else:
            # stdin에서 모든 데이터 읽기
            image_buffer = sys.stdin.buffer.read()
            stdin_read_time = time.time() - stdin_read_start
            
            if len(image_buffer) == 0:
                result = {
                    "success": False,
                    "error": "이미지 데이터가 필요합니다."
                }
            else:
                # analyze_face_age_from_buffer 내부에서 실제 모델 러닝 타임 측정
                result = analyze_face_age_from_buffer(image_buffer)
                
    except Exception as e:
        result = {
            "success": False,
            "error": f"이미지 처리 중 오류 발생: {str(e)}"
        }
    
    # 전체 스크립트 실행 시간
    script_total_time = time.time() - script_start_time
    print(f"[타이밍] stdin 읽기: {stdin_read_time:.3f}초 | 스크립트 전체: {script_total_time:.2f}초", file=sys.stderr)

    # JSON으로 결과 출력
    # InsightFace가 stdout에 출력할 수 있으므로, TypeScript에서 마지막 JSON 라인을 추출함
    print(json.dumps(result, ensure_ascii=False))

