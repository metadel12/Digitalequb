from fastapi import APIRouter, Depends

from ...dependencies import get_current_active_user
from ...models.user import User
from ...schemas.group import InviteDispatchRequest, InviteDispatchResponse
from ...services.email_service import EmailService

router = APIRouter()


@router.post("/send-invites", response_model=InviteDispatchResponse)
async def send_invites(
    payload: InviteDispatchRequest,
    current_user: User = Depends(get_current_active_user),
):
    email_service = EmailService()
    sent = 0
    failed = 0

    for recipient in payload.recipients:
        subject = f"Invitation to join {payload.group_name}"
        body = f"""
        <html>
        <body>
            <h2>You have been invited to DigiEqub</h2>
            <p>Group: <strong>{payload.group_name}</strong></p>
            <p>Contribution: {payload.amount or 0} {payload.currency} {payload.frequency}</p>
            <p>Join code: <strong>{payload.join_code}</strong></p>
            <p>Join link: {payload.group_link or 'DigiEqub app'}</p>
        </body>
        </html>
        """

        try:
            result = await email_service.send_email(recipient, subject, body)
            if result.get('status') == 'sent':
                sent += 1
            else:
                failed += 1
        except Exception:
            failed += 1

    return InviteDispatchResponse(success=True, sent=sent, failed=failed, channel='email')
