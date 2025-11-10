# 얼굴 나이 측정 및 랭킹 시스템

DT FAIR 2025 전시회용 얼굴 나이 측정 및 랭킹 애플리케이션입니다.

## 주요 기능

- 웹캠을 통한 얼굴 촬영
- AI 기반 얼굴 나이 분석
- 실시간 랭킹 시스템 (동안랭킹 / 노안랭킹)
- 구글 시트 연동을 통한 데이터 저장

## 기술 스택

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI) + Tailwind CSS
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)

### Backend
- **Framework**: Express.js + TypeScript
- **Database**: Google Sheets API
- **Real-time**: Server-Sent Events (SSE)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 구글 스프레드시트 ID (선택사항 - 랭킹 기능 사용 시 필요)
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# 서비스 계정 키 JSON (선택사항 - 랭킹 기능 사용 시 필요)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# 얼굴 나이 분석 모드 설정 (선택사항)
# "local": 로컬 모델 사용 (기본값)
# "remote": 원격 API 사용
# "none": 비활성화 (시뮬레이션 모드)
FACE_AGE_MODE=local

# 로컬 모델 경로 (FACE_AGE_MODE=local일 때)
FACE_AGE_MODEL_PATH=./models/face-age-model.onnx

# 원격 API URL (FACE_AGE_MODE=remote일 때)
FACE_AGE_API_URL=https://api.example.com/face-age
FACE_AGE_API_KEY=your_api_key_here

# 엑셀 파일 경로 (선택사항 - 기본값: ./data/employees.xlsx)
EXCEL_FILE_PATH=./data/employees.xlsx
```

**참고**: 구글 시트 연동이 없어도 기본 기능은 동작합니다. 랭킹 기능만 비활성화됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:5001` (또는 환경 변수 PORT에 지정한 포트)에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 구글 시트 연동 설정 (선택사항)

랭킹 기능을 사용하려면 구글 시트 연동이 필요합니다.

### 1. 구글 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com)에 접속하여 빈 스프레드시트 생성
2. 스프레드시트 URL에서 **스프레드시트 ID** 복사
   - 예: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 2. Google Cloud 프로젝트 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스** > **라이브러리**에서 "Google Sheets API" 검색 후 사용 설정
4. **API 및 서비스** > **사용자 인증 정보**에서 서비스 계정 생성
5. 서비스 계정의 **키** 탭에서 JSON 키 파일 다운로드

### 3. 스프레드시트 공유

1. 다운로드한 JSON 파일에서 `client_email` 확인
2. 구글 스프레드시트의 **공유** 버튼 클릭
3. 서비스 계정 이메일 주소 입력 (편집 권한 부여)

### 4. 환경 변수 설정

다운로드한 JSON 파일의 전체 내용을 `.env` 파일의 `GOOGLE_SERVICE_ACCOUNT_KEY`에 추가:

```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

## 프로젝트 구조

```
FaceAgeRank/
├── client/                 # 프론트엔드 (React)
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   └── lib/           # 유틸리티
│   └── public/            # 정적 파일
├── server/                # 백엔드 (Express)
│   ├── routes.ts          # API 라우트
│   ├── googleSheets.ts    # 구글 시트 연동
│   └── storage.ts         # 데이터 저장소
└── shared/                # 공유 스키마
```

## 주요 화면

- **로그인**: 회사명 및 사번 입력
- **환영 화면**: 사용자 이름 표시
- **촬영 안내**: 웹캠 촬영 가이드
- **웹캠 촬영**: 카운트다운 후 자동 촬영
- **분석 결과**: 얼굴 나이 및 실제 나이 비교
- **랭킹보드**: 동안랭킹 / 노안랭킹 실시간 표시

## 얼굴 나이 분석 설정

현재 얼굴 나이 분석은 기본적으로 시뮬레이션 모드로 동작합니다. 실제 모델을 연동하려면 환경 변수를 설정하세요.

### 로컬 모델 사용
```env
FACE_AGE_MODE=local
FACE_AGE_MODEL_PATH=./models/face-age-model.onnx
```

### 원격 API 사용
```env
FACE_AGE_MODE=remote
FACE_AGE_API_URL=https://api.example.com/face-age
FACE_AGE_API_KEY=your_api_key_here
```

### 시뮬레이션 모드 (기본값)
환경 변수를 설정하지 않으면 랜덤 값으로 동작합니다.

## 엑셀 파일 설정

회사와 사번으로 직원 정보를 조회하려면 엑셀 파일이 필요합니다.

### 엑셀 파일 형식

`data/employees.xlsx` 파일에 다음 컬럼이 필요합니다:
- **회사**: 회사명
- **사번**: 직원 사번
- **이름**: 직원 이름
- **생년월일**: YYYY-MM-DD 형식 (예: 1994-05-15)
- **부서**: 부서명

### 엑셀 파일 경로 설정

기본 경로는 `./data/employees.xlsx`입니다. 다른 경로를 사용하려면 환경 변수를 설정하세요:

```env
EXCEL_FILE_PATH=./path/to/your/employees.xlsx
```

**참고**: 엑셀 파일은 필수입니다. 파일이 없으면 서버가 시작되지 않습니다.

## 향후 구현 예정 기능

다음 기능들이 구현 예정입니다:

1. **얼굴 인식 모델 실제 연동**: `server/faceAgeService.ts`의 `LocalFaceAgeService`와 `RemoteFaceAgeService` 클래스에 실제 모델 로직 구현

## 제작 정보

- **AI 개발**: 조유민 주임 (농심 DT추진팀)
- **UI/UX 디자인 및 프론트엔드 개발**: 이원준 주임 (디지털전략팀)

© 2025 농심 DT추진팀. All rights reserved.
