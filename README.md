# 얼굴 나이 측정 및 랭킹 시스템

DT FAIR 2025 전시회용 얼굴 나이 측정 및 랭킹 애플리케이션입니다.

## 주요 기능

- 웹캠을 통한 얼굴 촬영 (자동 이미지 압축)
- AI 기반 얼굴 나이 분석
- 실시간 랭킹 시스템
- 구글 시트 연동을 통한 데이터 저장

## 기술 스택

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI) + Tailwind CSS
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + PostCSS
- **Libraries**: react-webcam (웹캠), canvas-confetti (팡파레 효과), particles.js (배경 파티클 효과, CDN)

### Backend
- **Framework**: Express.js + TypeScript
- **Build Tool**: esbuild (프로덕션), tsx (개발)
- **Database**: Google Sheets API
- **Real-time**: Server-Sent Events (SSE)
- **Data Processing**: XLSX (엑셀 파일 읽기), Zod (스키마 검증)

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
│   ├── faceAgeService.ts  # 얼굴 나이 분석 서비스
│   ├── storage.ts         # 데이터 저장소
│   └── services/          # 서비스 레이어
│       ├── analysisService.ts  # 얼굴 분석 서비스
│       ├── rankingService.ts   # 랭킹 조회 서비스
│       ├── sseService.ts        # SSE 연결 관리 서비스
│       └── userService.ts       # 사용자 조회 서비스
└── shared/                # 공유 스키마
```

## 주요 화면

- **로그인**: 회사명 및 사번 입력 (엑셀 파일에서 검색)
- **환영 화면**: 사용자 이름 표시
- **촬영 안내**: 웹캠 촬영 가이드
- **웹캠 촬영**: 카운트다운 후 자동 촬영
- **분석 중**: 얼굴 분석 진행 화면
- **분석 결과**: 얼굴 나이 및 실제 나이 비교 (동안일 때만 팡파레 효과)
- **랭킹보드**: 
  - 상위 랭킹 (얼굴 나이 < 실제 나이): 파란색 테마
  - 하위 랭킹 (얼굴 나이 > 실제 나이): 회색 테마
  - 실시간 SSE 연결 상태 표시
  - 순위별 배지 표시 (1위: 금메달, 2위: 은메달, 3위: 동메달)
  - 실시간 랭킹 갱신 (SSE를 통한 자동 새로고침)

## 얼굴 나이 분석 설정

현재 얼굴 나이 분석은 기본적으로 시뮬레이션 모드로 동작합니다 (랜덤 값 반환). 실제 모델을 연동하려면 환경 변수를 설정하세요.

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

### 시뮬레이션 모드
```env
FACE_AGE_MODE=none
```

`none` 모드로 설정하면 실제 얼굴 분석 없이 20-49 사이의 랜덤 값을 반환합니다. 개발 및 테스트 목적으로 사용할 수 있습니다.

## 엑셀 파일 설정

회사와 사번으로 직원 정보를 조회하려면 엑셀 파일이 필요합니다.

### 엑셀 파일 형식

`data/employees.xlsx` 파일에 다음 컬럼이 필요합니다:
- **회사**: 회사명
- **사번**: 직원 사번 (문자열로 처리)
- **이름**: 직원 이름
- **생년월일**: 8자리 숫자 형식 (예: `19970919`) - **필수**
- **부서**: 부서명

**중요**: 생년월일은 반드시 8자리 숫자 형식(`19970919`)이어야 합니다. 프로그램은 이 값을 오늘 날짜 기준으로 만 나이로 자동 계산합니다.

### 엑셀 파일 경로 설정

기본 경로는 `./data/employees.xlsx`입니다. 다른 경로를 사용하려면 환경 변수를 설정하세요:

```env
EXCEL_FILE_PATH=./path/to/your/employees.xlsx
```

### 엑셀 파일 수정 시 주의사항

**⚠️ 중요**: 엑셀 파일은 서버 시작 시 한 번만 메모리에 로드됩니다. 엑셀 파일을 수정한 후에는 **서버를 재시작**해야 새로운 데이터가 반영됩니다.

```bash
# 서버 재시작
# 개발 모드: Ctrl+C로 종료 후 npm run dev
# 프로덕션: npm start를 다시 실행
```

**참고**: 엑셀 파일은 필수입니다. 파일이 없으면 서버가 시작되지 않습니다.

## 동작 흐름

1. 사용자가 로그인 화면에서 **회사명**과 **사번** 입력
2. 서버가 `data/employees.xlsx` 파일에서 해당 정보 검색
3. 엑셀에서 찾으면: 이름, 생년월일, 부서 정보 읽기
4. 생년월일(8자리 숫자)을 오늘 날짜 기준으로 **만 나이** 자동 계산
5. 사용자 정보를 화면에 표시 (환영 화면, 결과 화면 등)
6. 얼굴 촬영 후 이미지 자동 압축 (최대 너비 800px, JPEG 품질 0.7)
7. 압축된 이미지를 서버로 전송하여 AI 분석 (또는 시뮬레이션 모드에서 랜덤 값)
8. 결과 화면에 실제 나이와 얼굴 나이 비교 표시
9. 동안일 경우 팡파레 효과 표시
10. 분석 결과가 구글 시트에 저장되고 랭킹에 반영됨
11. 랭킹보드에서 실시간으로 순위 확인 가능 (SSE를 통한 자동 갱신)

## 랭킹 시스템

랭킹은 **나이 차이**를 기준으로 계산됩니다:
- **나이 차이** = 실제 나이 - 얼굴 나이
- **상위 랭킹**: 나이 차이가 음수 또는 0 (얼굴 나이 ≤ 실제 나이) - 파란색 테마
- **하위 랭킹**: 나이 차이가 양수 (얼굴 나이 > 실제 나이) - 회색 테마

### 랭킹 정렬 규칙
1. **절댓값 기준 내림차순**: 나이 차이의 절댓값이 클수록 상위
2. **동점 처리**: 같은 절댓값이면 최신순 (분석 완료 시각 기준)

### 중복 제거 규칙
- 같은 사번으로 여러 번 분석한 경우, **최신 분석 결과만** 랭킹에 반영됩니다
- 구글 시트에 저장된 모든 데이터 중에서 사번 기준으로 중복을 제거하고, 같은 사번이 여러 개 있으면 `completedAt` (분석 완료 시각)이 가장 최신인 것만 선택합니다

### 실시간 갱신
- Server-Sent Events (SSE)를 통해 새로운 분석 결과가 추가되면 자동으로 랭킹 갱신
- 랭킹보드에서 연결 상태 표시 (실시간 연결됨 / 연결 중...)
- 30초마다 heartbeat 메시지를 전송하여 연결 상태 유지

## 성능 최적화

### 이미지 압축
- 웹캠에서 촬영한 이미지는 자동으로 압축되어 서버로 전송됩니다
- **압축 설정**: 최대 너비 800px, JPEG 품질 0.7
- 비율을 유지하면서 크기를 조정하여 네트워크 전송량을 줄이고 서버 처리 속도를 향상시킵니다

## 향후 구현 예정 기능

다음 기능들이 구현 예정입니다:

1. **얼굴 인식 모델 실제 연동**: `server/faceAgeService.ts`의 `LocalFaceAgeService`와 `RemoteFaceAgeService` 클래스에 실제 모델 로직 구현

## 라이선스

이 프로젝트는 농심 DT추진팀의 독점 소프트웨어입니다. 무단 복제, 배포, 수정을 금지합니다.

© 2025 농심 DT추진팀. All rights reserved.

### 오픈소스 라이브러리

이 프로젝트는 다음 오픈소스 라이브러리를 사용합니다:

- **React** (MIT License)
- **Express.js** (MIT License)
- **Radix UI** (MIT License)
- **TanStack Query** (MIT License)
- **particles.js** (MIT License) - CDN을 통해 로드
- **기타 의존성**: `package.json`의 `dependencies` 및 `devDependencies` 참조

각 라이브러리의 라이선스는 해당 프로젝트의 LICENSE 파일을 참조하세요.

## 제작 정보

- **프론트엔드 개발 및 백엔드 연동**: 조유민 주임 (농심 DT추진팀)
- **AI 모델 개발**: 이원준 주임 (농심 디지털전략팀)
