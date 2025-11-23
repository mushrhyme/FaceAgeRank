# 얼굴 나이 측정 및 랭킹 시스템

DT FAIR 2025 전시회용 얼굴 나이 측정 및 랭킹 애플리케이션입니다.

## 기술 스택

- **프론트엔드**: React + TypeScript + Vite + Tailwind CSS
- **백엔드**: Node.js + Express + TypeScript
- **AI 모델**: InsightFace (얼굴 감지) + ONNX (나이 추정, ResNet18 기반)
- **데이터 저장**: Google Sheets API
- **사용자 데이터**: Excel 파일 (XLSX)

## 사전 요구사항

- Node.js 18 이상
- Python 3.8 이상
- `age_estimation.onnx` 모델 파일 (프로젝트 루트에 위치)

## 설치 및 실행

### 1. Node.js 의존성 설치

```bash
npm install
```

### 2. Python 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FACE_AGE_MODEL_PATH=./age_estimation.onnx
EXCEL_FILE_PATH=./data/employees.xlsx
PORT=5001
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버는 기본적으로 `http://localhost:5001`에서 실행됩니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 엑셀 파일 형식

`data/employees.xlsx` 파일에 다음 컬럼이 필요합니다:

- 회사
- 부서
- 사번
- 이름
- 출생년도 (8자리, 예: 19900101)
- 성별

## 주요 기능

- 웹캠을 통한 실시간 얼굴 캡처
- InsightFace를 이용한 얼굴 감지
- ONNX 모델을 이용한 나이 추정
- 실제 나이와 얼굴 나이 비교
- Google Sheets에 결과 자동 저장
- 실시간 랭킹 보드 (나이 차이 기준)

## 라이선스

이 프로젝트는 농심 DT추진팀의 독점 소프트웨어입니다. 무단 복제, 배포, 수정을 금지합니다.

© 2025 농심 DT추진팀. All rights reserved.
