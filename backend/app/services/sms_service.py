from twilio.rest import Client
from app.core.config import settings

class SMSService:
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.from_number = settings.TWILIO_PHONE_NUMBER

    async def send_sms(self, to_number: str, message: str):
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            return {"status": "sent", "message_sid": message.sid}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def send_otp_sms(self, to_number: str, otp: str):
        message = f"Your DigiEqub OTP is: {otp}. Valid for {settings.OTP_EXPIRY_MINUTES} minutes."
        return await self.send_sms(to_number, message)

    async def send_equb_notification(self, to_number: str, equb_name: str, message: str):
        full_message = f"DigiEqub - {equb_name}: {message}"
        return await self.send_sms(to_number, full_message)

    async def send_payment_reminder(self, to_number: str, equb_name: str, amount: float):
        message = f"Reminder: Your contribution of ${amount} for {equb_name} is due."
        return await self.send_sms(to_number, message)
