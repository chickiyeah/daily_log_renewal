import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
    BASE_URL: str = os.getenv("BASE_URL", "https://dailylog.decodns.org") # 메일 링크용

settings = Settings()

def send_reset_email(target_email: str, reset_link: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = '[DAILY LOG] 계정 비밀번호 변경 안내'
    msg['From'] = f"DAILY LOG <{settings.SMTP_USER}>"
    msg['To'] = target_email

    # 주신 HTML 디자인 적용 (f-string 사용)
    html_content = f"""
    <html>
      <body>
        <div align="center" style="border-style: solid; border-width: thin; border-color:#dadce0; border-radius: 8px; padding: 40px 20px; max-width: 516px; margin: 0 auto;">
            <img src='https://firebasestorage.googleapis.com/v0/b/dabom-ca6fe.appspot.com/o/dabomlogo.png?alt=media&token=8b895151-37d3-4bbe-ae65-efdd6adb6ff7' width="74" height="54" style="margin-bottom: 16px;"/>
            <div style="font-family: 'Google Sans',Roboto,sans-serif; border-bottom: thin solid #dadce0; color: rgba(0,0,0,0.87); line-height: 32px; padding-bottom: 24px; text-align: center; font-size: 24px;">
                계정 비밀번호 초기화
            </div>
            <div style="font-family: Roboto,sans-serif; font-size: 14px; color: rgba(0,0,0,0.87); line-height: 20px; padding-top: 20px; text-align: center;">
                <p>비밀번호 초기화 요청이 접수되어 링크를 보내드립니다.</p>
                <p>아래 버튼을 클릭하여 비밀번호를 새로 설정하실 수 있습니다.</p>
                <br>
                <a href='{reset_link}' style="background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">비밀번호 재설정하기</a>
                <br><br>
                <strong>본인이 요청하지 않은 경우 이 메일을 무시하세요.</strong>
                <p style="color: #5f6368; font-size: 12px; margin-top: 30px;">
                    ※ 본 메일은 발신 전용 메일입니다.
                </p>
            </div>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(html_content, 'html'))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls() # 보안 연결
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, target_email, msg.as_string())
        return True
    except Exception as e:
        print(f"메일 발송 에러: {e}")
        return False