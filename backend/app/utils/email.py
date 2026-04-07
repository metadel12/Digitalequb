import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email: str, subject: str, body: str) -> dict:
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_FROM
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.EMAIL_FROM, to_email, text)
        server.quit()

        return {"status": "sent", "message": "Email sent successfully"}
    except Exception as e:
        return {"status": "failed", "message": str(e)}

def send_otp_email(to_email: str, otp: str) -> dict:
    """Send OTP email"""
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
    return send_email(to_email, subject, body)

def send_welcome_email(to_email: str, full_name: str) -> dict:
    """Send welcome email"""
    subject = "Welcome to DigiEqub!"
    body = f"""
    <html>
    <body>
        <h2>Welcome {full_name}!</h2>
        <p>Thank you for joining DigiEqub. Your account has been created successfully.</p>
        <p>You can now start creating or joining equb groups.</p>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)


async def send_verification_email(to_email: str, user_id: str) -> dict:
    """Send account verification email."""
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={user_id}"
    subject = "Verify your DigiEqub account"
    body = f"""
    <html>
    <body>
        <h2>Verify your email</h2>
        <p>Thanks for registering with DigiEqub.</p>
        <p>Please verify your account by clicking the link below:</p>
        <p><a href="{verification_link}">Verify Email</a></p>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)


async def send_password_reset_email(to_email: str, reset_token: str) -> dict:
    """Send password reset email."""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    subject = "Reset your DigiEqub password"
    body = f"""
    <html>
    <body>
        <h2>Password reset request</h2>
        <p>We received a request to reset your DigiEqub password.</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)
