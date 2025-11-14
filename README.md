# 얼굴 나이 측정 및 랭킹 시스템

DT FAIR 2025 전시회용 얼굴 나이 측정 및 랭킹 애플리케이션입니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경 변수

`.env` 파일 생성:

```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FACE_AGE_MODEL_PATH=./age_estimation.onnx
EXCEL_FILE_PATH=./data/employees.xlsx
```

## 엑셀 파일

`data/employees.xlsx` 파일에 다음 컬럼 필요: 회사, 부서, 사번, 이름, 출생년도(8자리), 성별

## 라이선스

이 프로젝트는 농심 DT추진팀의 독점 소프트웨어입니다. 무단 복제, 배포, 수정을 금지합니다.

© 2025 농심 DT추진팀. All rights reserved.
