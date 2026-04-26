import os

import httpx
from dotenv import load_dotenv

load_dotenv()


def test_sms() -> None:
    phone_number = os.getenv("TEST_SMS_TO", "")
    if not phone_number:
        print("SMS failed: set TEST_SMS_TO in backend/.env")
        return

    try:
        response = httpx.post(
            "https://api.sandbox.africastalking.com/version1/messaging",
            headers={
                "apiKey": os.getenv("AFRICASTALKING_API_KEY", ""),
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            data={
                "username": os.getenv("AFRICASTALKING_USERNAME", "sandbox"),
                "to": phone_number,
                "message": "DigiEqub SMS test message",
                "from": os.getenv("AFRICASTALKING_SENDER", "DigiEqub"),
            },
            timeout=15.0,
        )
        print(f"SMS response: {response.status_code} {response.text}")
    except Exception as exc:
        print(f"SMS failed: {exc}")
