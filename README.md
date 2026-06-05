# daily_log (일기)

하루를 기록하는 일기(다이어리) 웹 앱. 글·기분·식사·만난 사람·사진과 **카카오맵 위치**를 함께 남기고, 유저 랭킹·오늘의 명언 등 동기부여 요소를 갖췄다. FastAPI 백엔드 + Jinja 템플릿. (이전 `dailylog`의 리뉴얼 버전)

## 기술 스택
- **Backend**: FastAPI 0.115, Uvicorn
- **DB**: MySQL (PyMySQL), SQLAlchemy 2.0
- **인증**: bcrypt(비밀번호 해시), python-jose(JWT)
- **프론트**: Jinja2 + JS/CSS, 카카오맵 API
- **메일**: SMTP (아이디/비밀번호 찾기)
- **기타**: python-multipart(이미지 업로드), python-dotenv, email-validator

## 데이터 모델
- **User** — 이메일·닉네임·이름·전화·생일 (일기와 1:N, 탈퇴 시 글 자동 삭제)
- **Post(일기)** — 제목·내용 + 오늘의 기분·오늘의 메뉴·만난 사람 + 사진 + 카카오맵 위치(지번/도로명 주소·위경도·장소명)

## 주요 기능
- **일기 작성/수정/삭제** — 기분·메뉴·만난 사람·사진·위치 기록
- **카카오맵 위치 기록** — 지도에서 장소 선택, 주소·좌표·장소명 저장
- **이미지 업로드 + 내 이미지 갤러리**
- **유저 랭킹** — 작성 활동 기반
- **오늘의 명언**
- **전체 일기 보기** — 모두의 기록
- **회원** — 가입·로그인·정보 수정·탈퇴
- **계정 찾기** — 아이디 찾기 / 비밀번호 재설정 (이메일)

## 실행
```
pip install -r requirements.txt
uvicorn app.main:app --reload
```
`.env`에 DB 접속 정보·JWT 시크릿·SMTP(메일)·카카오맵 키·BASE_URL 설정. (실제 값은 커밋 금지)

## 디렉터리
- `app/main.py` — FastAPI 엔트리 + 라우트
- `app/auth.py` — 인증
- `app/models.py` / `app/schemas.py` / `app/database.py` — 모델·스키마·DB
- `app/utils/` — 유틸
- `app/templates/` + `app/static/` — 프론트
