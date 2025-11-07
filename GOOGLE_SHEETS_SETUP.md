# 구글 시트 연동 설정 가이드

분석 결과를 구글 시트에 자동으로 저장하기 위한 설정 방법입니다.

## 1. 구글 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. 빈 스프레드시트 생성
3. 스프레드시트 URL에서 **스프레드시트 ID** 복사
   - 예: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - `SPREADSHEET_ID` 부분이 스프레드시트 ID입니다

## 2. Google Cloud 프로젝트 설정

### 2.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)

### 2.2 Google Sheets API 활성화
1. **API 및 서비스** > **라이브러리** 메뉴로 이동
2. "Google Sheets API" 검색
3. **사용 설정** 클릭

### 2.3 서비스 계정 생성
1. **API 및 서비스** > **사용자 인증 정보** 메뉴로 이동
2. **사용자 인증 정보 만들기** > **서비스 계정** 선택
3. 서비스 계정 이름 입력 (예: "face-age-rank-sheets")
4. **만들기** 클릭
5. 역할은 선택하지 않고 **완료** 클릭

### 2.4 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. **키** 탭으로 이동
3. **키 추가** > **새 키 만들기** 선택
4. 키 유형: **JSON** 선택
5. **만들기** 클릭
6. JSON 파일이 자동으로 다운로드됩니다

## 3. 스프레드시트 공유 설정

1. 다운로드한 JSON 파일을 열어서 `client_email` 필드 확인
   - 예: `"client_email": "face-age-rank-sheets@your-project.iam.gserviceaccount.com"`
2. 구글 스프레드시트로 돌아가기
3. **공유** 버튼 클릭
4. 서비스 계정 이메일 주소 입력
5. 권한: **편집자** 선택
6. **완료** 클릭

## 4. 환경 변수 설정

### 4.1 서비스 계정 키 JSON 내용 가져오기
다운로드한 JSON 파일을 열어서 전체 내용을 복사합니다.

### 4.2 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
# 구글 스프레드시트 ID (URL에서 추출)
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# 서비스 계정 키 JSON (전체 JSON을 한 줄로 변환하거나 줄바꿈 포함)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**중요**: `GOOGLE_SERVICE_ACCOUNT_KEY`는 JSON 파일의 전체 내용을 그대로 넣어야 합니다.
- 줄바꿈이 포함되어 있어도 됩니다
- 따옴표는 이스케이프 처리할 필요 없습니다

### 4.3 코드 샌드박스 환경에서 설정하는 방법

코드 샌드박스에서는 환경 변수를 다음과 같이 설정합니다:

1. 프로젝트 루트에 `.env` 파일 생성 (또는 기존 파일 수정)
2. 다음 내용 추가:
   ```env
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```
3. 서버 재시작

**참고**: 코드 샌드박스의 환경 변수 설정 방법은 플랫폼마다 다를 수 있습니다. 
일반적으로 `.env` 파일을 사용하거나, 플랫폼의 환경 변수 설정 메뉴를 사용합니다.

## 5. 스프레드시트 구조

시트는 자동으로 다음 헤더가 생성됩니다:
- 회사
- 사번
- 이름
- 실제 나이
- 얼굴 나이
- 나이 차이
- 분석 완료 시각

## 6. 테스트

1. 서버 재시작
2. 애플리케이션에서 로그인 후 분석 완료
3. 구글 스프레드시트에서 데이터가 추가되었는지 확인

## 문제 해결

### "구글 시트 서비스가 설정되지 않았습니다" 오류
- 환경 변수가 제대로 설정되었는지 확인
- 서버를 재시작했는지 확인

### "권한 없음" 오류
- 서비스 계정 이메일이 스프레드시트에 공유되어 있는지 확인
- 공유 권한이 "편집자"인지 확인

### "스프레드시트를 찾을 수 없습니다" 오류
- `GOOGLE_SPREADSHEET_ID`가 올바른지 확인
- 스프레드시트가 삭제되지 않았는지 확인

