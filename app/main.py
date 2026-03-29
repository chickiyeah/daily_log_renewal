from datetime import datetime
import os
import uuid

from fastapi import FastAPI, Depends, File, HTTPException, UploadFile, status, Request, Form
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
#
# ---------------------------------------------------------
# [Page] HTML 렌더링 컨트롤러 (브라우저 접속용)
# ---------------------------------------------------------
@app.get("/map", response_class=HTMLResponse)
async def map(request: Request):
    return templates.TemplateResponse("map.html", {"request": request})

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

@app.get("/Mypage", response_class=HTMLResponse)
async def login_page(request: Request):
    """로그인 페이지 이동"""
    return templates.TemplateResponse("profile.html", {"request": request})

# --------------------------------------------------------
# [WEB] 일기 작성
# --------------------------------------------------------

@app.get("/write/1", response_class=HTMLResponse)
def write(request: Request):
    return templates.TemplateResponse("write1.html", {"request": request})

@app.get("/write/2", response_class=HTMLResponse)
def write2(request: Request):
    return templates.TemplateResponse("write2.html", {"request": request})

@app.get("/write/popupmap", response_class=HTMLResponse)
async def writemap(request: Request):
    return templates.TemplateResponse("popupmap.html", {"request": request})

@app.get("/write/edit", response_class=HTMLResponse)
async def edit(request: Request):
    return templates.TemplateResponse("write2(update).html", {"request": request})

@app.get("/write/detail", response_class=HTMLResponse)
async def edit(request: Request):
    return templates.TemplateResponse("detail.html", {"request": request})

#랭킹
@app.get("/rank", response_class=HTMLResponse)
async def read_ranking_page(request: Request):
    # templates.TemplateResponse를 사용하여 HTML 파일을 반환합니다.
    return templates.TemplateResponse("ranking.html", {"request": request})

@app.get("/Mypage/Write", response_class=HTMLResponse)
async def read_ranking_page(request: Request):
    # templates.TemplateResponse를 사용하여 HTML 파일을 반환합니다.
    return templates.TemplateResponse("mywrite.html", {"request": request})

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

# 내 정보 가져오기
@app.get("/api/user/me")
async def read_user_me(current_user: models.User = Depends(auth.get_current_user)):
    """로그인한 사람만 볼 수 있는 내 정보 API"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nickname": current_user.nickname,
        "name": current_user.name,
        "phone": current_user.phone,
        "birthday": current_user.birthday
    }


# 랜덤 명언 (기존 Good_Say 대체)
@app.get("/api/quotes/random")
async def get_quote():
    # 이 부분은 DB에서 가져오거나 리스트에서 랜덤 반환
    return {"message": "행복은 습관이다.", "author": "허버드"}

# ---------------------------------------------------------

# app/main.py 에 추가

@app.patch("/api/user/update")
async def update_user_info(
    nickname: str = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. 기존 닉네임과 동일한지 체크 (선택 사항)
    if current_user.nickname == nickname:
        raise HTTPException(status_code=400, detail="변경사항이 없습니다.")

    # 2. 닉네임 업데이트
    current_user.nickname = nickname
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"status": "OK", "message": "닉네임이 변경되었습니다."}

# ------------------------------------------------------------
# 일기 API
# ------------------------------------------------------------

# 내 모든 글 가져오기
@app.get("/api/posts/mine")
async def get_my_posts(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Post).filter(models.Post.author_id == current_user.id).all()

#일기 목록 조회 
@app.get("/api/posts/my-list")
async def get_my_posts_list(
    page: int = 0, 
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    # 전체 게시글 수 계산
    total_count = db.query(models.Post).filter(models.Post.author_id == current_user.id).count()
    
    # 페이징 적용하여 가져오기
    posts = db.query(models.Post)\
        .filter(models.Post.author_id == current_user.id)\
        .order_by(models.Post.created_at.desc())\
        .offset(page * limit)\
        .limit(limit)\
        .all()
    
    return {
        "total": total_count,
        "items": posts,
        "page": page,
        "limit": limit
    }

# 1. 이미지 업로드 API (파일을 서버에 저장하고 경로 반환)
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    UPLOAD_DIR = "app/static/uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    return f"/static/uploads/{file_name}"

# 2. 일기 작성 API
# app/main.py

@app.post("/api/posts")
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    feel: str = Form(...),
    eat: str = Form(...),
    people_meet: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    address: str = Form(...),
    place_name: str = Form(None),
    image_url: str = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 여기서 전달하는 키(왼쪽)가 models.py의 변수명과 일치해야 합니다!
    new_post = models.Post(
        author_id=current_user.id,
        title=title,
        content=content,
        feel=feel,
        eat=eat,
        people_meet=people_meet,
        image_url=image_url,
        
        # 수정된 부분: 모델의 필드명(area_xxx)에 맞춰서 값을 매핑
        area_adr=address,           # address -> area_adr
        area_lat=lat,               # lat -> area_lat
        area_lng=lng,               # lng -> area_lng
        area_name=place_name        # place_name -> area_name
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post) # 생성된 후 ID 등을 업데이트 받기 위해 추가하는 것이 좋습니다.
    
    return {"status": "OK", "id": new_post.id}

#일기 수정
@app.patch("/api/posts/{post_id}")
async def update_post(
    post_id: int,
    title: str = Form(...),
    content: str = Form(...),
    feel: str = Form(...),
    eat: str = Form(...),
    people_meet: str = Form(...),
    image_url: str = Form(None),
    address: str = Form(None),
    place_name: str = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. 수정할 글이 본인 글인지 확인
    post = db.query(models.Post).filter(
        models.Post.id == post_id, 
        models.Post.author_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없거나 수정 권한이 없습니다.")

    # 2. 값 업데이트
    post.title = title
    post.content = content
    post.feel = feel
    post.eat = eat
    post.people_meet = people_meet
    post.image_url = image_url
    if address: post.area_adr = address
    if place_name: post.area_name = place_name

    db.commit() # 변경사항 DB 반영
    return {"status": "OK"}

#일기 디테일
@app.get("/api/posts/{post_id}")
async def get_post_detail(
    post_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 내 글인지 확인하고 가져오기 (보안)
    post = db.query(models.Post).filter(
        models.Post.id == post_id, 
        models.Post.author_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다.")
        
    return post

#일기 삭제
@app.delete("/api/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    post = db.query(models.Post).filter(models.Post.id == post_id, models.Post.author_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="삭제할 글이 없습니다.")
    
    db.delete(post)
    db.commit()
    return {"message": "삭제 완료"}

#----------------------------------
# 랭킹
#-----------------------------------
from collections import Counter

@app.get("/api/stats/ranking")
async def get_user_ranking(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    posts = db.query(models.Post).filter(models.Post.author_id == current_user.id).all()
    
    # 데이터 집계용 리스트
    feels = [p.feel for p in posts if p.feel]
    places = [p.area_adr for p in posts if p.area_adr]
    eats = [p.eat for p in posts if p.eat]
    
    # 사람 데이터는 콤마(,)로 구분되어 있을 수 있음
    people = []
    for p in posts:
        if p.people_meet and p.people_meet != "None":
            names = [n.strip() for n in p.people_meet.split(",")]
            people.extend(names)

    # 빈도수 계산 및 정렬 (Counter 사용)
    def format_rank(data_list):
        counts = Counter(data_list).most_common(10) # 상위 10개
        return [{"name": name, "count": count} for name, count in counts]

    return {
        "feel": format_rank(feels),
        "place": format_rank(places),
        "person": format_rank(people),
        "eat": format_rank(eats),
        "total_count": len(posts)
    }