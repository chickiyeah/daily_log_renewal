import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# .env에서 MySQL 주소를 가져옵니다.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# MySQL은 pool_pre_ping을 True로 주면 연결이 끊겼을 때 자동으로 재연결을 시도합니다.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=3600  # 1시간마다 연결 재설정 (MySQL 타임아웃 방지)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()