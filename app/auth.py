import os
import bcrypt  # passlib 대신 순수 bcrypt 사용
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# 1. 비밀번호 해시화 (가입 시)
def get_password_hash(password: str):
    # bcrypt는 바이트 문자열을 처리하므로 인코딩 필요
    pwd_bytes = password.encode('utf-8')
    # 솔트 생성 및 해싱
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # DB 저장을 위해 문자열로 디코딩해서 반환
    return hashed.decode('utf-8')

# 2. 비밀번호 일치 확인 (로그인 시)
def verify_password(plain_password: str, hashed_password: str):
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        # bcrypt.checkpw가 직접 비교를 수행함
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# 3. JWT 토큰 생성
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)