import os
import smtplib
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()


def test_email() -> None:
    try:
        server = smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT", "587")))
        server.starttls()
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD"))

        msg = MIMEText("Test email from DigiEqub")
        msg["Subject"] = "Test Email"
        msg["From"] = os.getenv("FROM_EMAIL", "noreply@digiequb.com")
        msg["To"] = "metizomawa@gmail.com"

        server.send_message(msg)
        server.quit()
        print("Email sent successfully")
    except Exception as exc:
        print(f"Email failed: {exc}")


if __name__ == "__main__":
    test_email()
