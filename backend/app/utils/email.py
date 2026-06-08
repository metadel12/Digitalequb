import base64
import json
from pathlib import Path
from typing import Optional
from google.oauth2.service_account import Credentials as SACredentials
from google.oauth2.credentials import Credentials as OAuth2Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def _get_gmail_service():
    """Initialize Gmail API service using OAuth2 or Service Account credentials."""
    try:
        # Try OAuth2 credentials first
        if settings.GMAIL_CLIENT_ID and settings.GMAIL_CLIENT_SECRET and settings.GMAIL_REFRESH_TOKEN:
            credentials = OAuth2Credentials(
                token=None,  # Will be fetched using refresh token
                refresh_token=settings.GMAIL_REFRESH_TOKEN,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GMAIL_CLIENT_ID,
                client_secret=settings.GMAIL_CLIENT_SECRET,
                scopes=['https://www.googleapis.com/auth/gmail.send']
            )
            # Refresh the token to get a valid access token
            credentials.refresh(Request())
            return build('gmail', 'v1', credentials=credentials)
        
        # Fallback to Service Account if OAuth2 not configured
        if settings.GMAIL_SERVICE_ACCOUNT_JSON:
            service_account_info = None
            try:
                service_account_info = json.loads(settings.GMAIL_SERVICE_ACCOUNT_JSON)
            except (json.JSONDecodeError, ValueError):
                # If not JSON string, try as file path
                sa_path = Path(settings.GMAIL_SERVICE_ACCOUNT_JSON)
                if sa_path.exists():
                    with open(sa_path) as f:
                        service_account_info = json.load(f)
            
            if service_account_info:
                credentials = SACredentials.from_service_account_info(
                    service_account_info,
                    scopes=['https://www.googleapis.com/auth/gmail.send']
                )
                return build('gmail', 'v1', credentials=credentials)
        
        return None
    except Exception as e:
        print(f"Error initializing Gmail service: {str(e)}")
        return None


def send_email(to_email: str, subject: str, body: str) -> dict:
    """Send email using Gmail REST API."""
    try:
        service = _get_gmail_service()
        if not service:
            return {"status": "failed", "message": "Gmail API service not configured"}
        
        from_email = settings.GMAIL_SENDER_EMAIL or getattr(settings, "FROM_EMAIL", "noreply@digiequb.com")
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        # Encode message to bytes and base64
        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        message = {'raw': raw_message}
        
        # Send message
        service.users().messages().send(userId='me', body=message).execute()
        return {"status": "sent", "message": "Email sent successfully"}
    except HttpError as e:
        error_msg = f"Gmail API error: {str(e)}"
        return {"status": "failed", "message": error_msg}
    except Exception as e:
        return {"status": "failed", "message": f"Error sending email: {str(e)}"}

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
