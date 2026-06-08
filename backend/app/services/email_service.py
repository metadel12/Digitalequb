import base64
import json
from pathlib import Path
from google.oauth2.service_account import Credentials as SACredentials
from google.oauth2.credentials import Credentials as OAuth2Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.email_from = settings.GMAIL_SENDER_EMAIL or getattr(settings, "FROM_EMAIL", "noreply@digiequb.com")
        self.gmail_service = None
        self._init_gmail_service()

    def _init_gmail_service(self):
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
                self.gmail_service = build('gmail', 'v1', credentials=credentials)
                return
            
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
                    self.gmail_service = build('gmail', 'v1', credentials=credentials)
        except Exception as e:
            print(f"Error initializing Gmail service: {str(e)}")
            self.gmail_service = None

    async def send_email(self, to_email: str, subject: str, body: str):
        """Send email using Gmail REST API."""
        try:
            if not self.gmail_service:
                return {
                    "status": "failed",
                    "message": "Gmail API service not configured. Set GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL.",
                }

            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.email_from
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            # Encode message to bytes and base64
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
            message = {'raw': raw_message}
            
            # Send message
            self.gmail_service.users().messages().send(userId='me', body=message).execute()
            return {"status": "sent", "message": "Email sent successfully"}
        except HttpError as e:
            error_msg = f"Gmail API error: {str(e)}"
            return {"status": "failed", "message": error_msg}
        except Exception as e:
            return {"status": "failed", "message": f"Error sending email: {str(e)}"}

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
