from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    birthday: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # 사용자가 작성한 게시글들 (1:N 관계)
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # 일기 기본 정보
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    feel: Mapped[str] = mapped_column(String(50), nullable=True) # 오늘의 기분 (맑음, 흐림 등)
    eat: Mapped[str] = mapped_column(String(50), nullable=True)  # 오늘의 메뉴 (한식, 일식 등)
    people_meet: Mapped[str] = mapped_column(String(255), nullable=True) # 만난 사람
    
    # 이미지 경로
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # 위치 정보 (카카오맵 연동 데이터)
    area_adr: Mapped[str] = mapped_column(String(255), nullable=True)        # 지번 주소
    area_load_adr: Mapped[str] = mapped_column(String(255), nullable=True)   # 도로명 주소
    area_lat: Mapped[float] = mapped_column(Numeric(10, 8), nullable=True)  # 위도
    area_lng: Mapped[float] = mapped_column(Numeric(11, 8), nullable=True)  # 경도
    area_name: Mapped[str] = mapped_column(String(255), nullable=True)       # 장소명
    area_custom_name: Mapped[str] = mapped_column(String(255), nullable=True)# 사용자 지정 이름
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # 유저 테이블과의 연결
    author = relationship("User", back_populates="posts")