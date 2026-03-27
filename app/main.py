from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import models, database, auth, schemas

# DB 테이블 생성 (최초 1회 실행 시 MySQL에 테이블 자동 생성)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 정적 파일 및 템플릿 설정
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ---------------------------------------------------------
# [Page] HTML 렌더링 컨트롤러 (브라우저 접속용)
# ---------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """회원가입 페이지 이동"""
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """로그인 페이지 이동"""
    return templates.TemplateResponse("Login.html", {"request": request})

# ---------------------------------------------------------
# [API] 데이터 처리 컨트롤러 (실제 로직)
# ---------------------------------------------------------

@app.post("/api/register")
async def register(
    email: str = Form(...),
    name: str = Form(...),
    nickname: str = Form(...),
    password: str = Form(...),
    birthday: str = Form(None), # 필수 아님 처리
    phone: str = Form(None),    # 필수 아님 처리
    db: Session = Depends(database.get_db)
):
    # 1. 이메일 중복 확인
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    # 2. 비밀번호 암호화
    hashed_pw = auth.get_password_hash(password)

    # 3. DB 저장
    new_user = models.User(
        email=email,
        name=name,
        nickname=nickname,
        hashed_password=hashed_pw,
        birthday=birthday,
        phone=phone,
        created_at=datetime.utcnow()
    )
    
    try:
        db.add(new_user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="데이터베이스 저장 오류")

    return {"status": "success", "message": "OK"}

@app.post("/api/login")
async def login_user(
    email: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(database.get_db)
):
    """로그인 처리 API (JWT 토큰 발급)"""
    # 1. 유저 찾기
    user = db.query(models.User).filter(models.User.email == email).first()
    
    # 2. 유저 존재 여부 및 비밀번호 검증
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 맞지 않습니다."
        )

    # 3. JWT 토큰 발행
    access_token = auth.create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "nickname": user.nickname # 프론트에서 표시용으로 추가
    }