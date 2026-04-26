import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = getattr(settings, "SMTP_HOST", None)
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_user = getattr(settings, "SMTP_USER", None)
        self.smtp_password = getattr(settings, "SMTP_PASSWORD", None)
        self.email_from = getattr(settings, "EMAIL_FROM", None) or getattr(settings, "FROM_EMAIL", "noreply@digiequb.com")

    async def send_email(self, to_email: str, subject: str, body: str):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_from
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            if not self.smtp_host or not self.smtp_user or not self.smtp_password:
                return {
                    "status": "failed",
                    "message": "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD to enable email delivery.",
                }

            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.email_from, to_email, text)
            server.quit()

            return {"status": "sent", "message": "Email sent successfully"}
        except Exception as e:
            return {"status": "failed", "message": str(e)}

    async def send_otp_email(self, to_email: str, otp: str):
        subject = "Your DigiEqub OTP"
        body = f"""
        <html>
        <body>
            <h2>DigiEqub OTP Verification</h2>
            <p>Your one-time password is: <strong>{otp}</strong></p>
            <p>This OTP will expire in {settings.OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, body)

    async def send_welcome_email(self, to_email: str, full_name: str):
        subject = "Welcome to DigiEqub!"
        body = f"""
        <html>
        <body>
            <h2>Welcome {full_name}!</h2>
            <p>Thank you for joining DigiEqub. Your account has been successfully created.</p>
            <p>You can now create or join Equb groups and start saving together.</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, body)

    async def send_equb_notification(self, to_email: str, equb_name: str, message: str):
        subject = f"DigiEqub - {equb_name}"
        body = f"""
        <html>
        <body>
            <h2>Equb Notification</h2>
            <p><strong>{equb_name}</strong></p>
            <p>{message}</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, body)
