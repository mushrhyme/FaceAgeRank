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

#### 같은 네트워크에서 접속하기

같은 Wi-Fi/이더넷 네트워크에 연결된 다른 기기에서 접속하려면:

1. 서버가 실행 중인 컴퓨터의 로컬 IP 주소 확인:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. 다른 기기에서 `http://[서버IP주소]:5001`로 접속
   - 예: `http://192.168.0.10:5001`

#### 다른 네트워크에서 접속하기

인터넷을 통해 다른 네트워크에서 접속하려면 다음 방법 중 하나를 사용하세요:

**방법 1: ngrok 사용 (가장 간단)**

1. [ngrok](https://ngrok.com/) 설치 및 무료 계정 가입
2. 대시보드에서 authtoken 복사: https://dashboard.ngrok.com/get-started/your-authtoken
3. authtoken 설정:
   ```bash
   ngrok authtoken [여기에_복사한_토큰_붙여넣기]
   ```
4. 서버 실행 후 ngrok 실행:
   ```bash
   # 서버가 HTTPS로 실행 중이므로 HTTPS를 명시적으로 지정
   ngrok http https://localhost:5001
   
   # 또는 포트만 지정해도 ngrok이 자동으로 HTTPS를 감지
   ngrok http 5001
   ```
5. 생성된 공개 URL (예: `https://xxxx-xx-xx-xx-xx.ngrok.io`)을 다른 사람에게 공유
   - ⚠️ 무료 버전은 서버 재시작 시 URL이 변경됩니다
   - ⚠️ ngrok 무료 버전은 첫 접속 시 경고 페이지가 표시될 수 있습니다 ("Visit Site" 버튼 클릭)

**방법 2: 포트 포워딩 (라우터 설정 필요)**

1. 라우터 관리 페이지 접속
2. 포트 포워딩 설정: 외부 포트 → 내부 IP:5001
3. 공인 IP 주소 확인 후 `http://[공인IP]:[외부포트]`로 접속
   - ⚠️ 보안 주의: 방화벽 및 인증 설정 권장

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
