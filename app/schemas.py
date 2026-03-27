from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 회원가입 시 입력 데이터
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str

# 로그인 시 입력 데이터
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 토큰 응답 형식
class Token(BaseModel):
    access_token: str
    token_type: str

# 토큰 안에 담길 데이터 정보
class TokenData(BaseModel):
    email: Optional[str] = None