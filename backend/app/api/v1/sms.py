from fastapi import APIRouter, Depends

from ...dependencies import get_current_active_user
from ...models.user import User
from ...schemas.group import InviteDispatchRequest, InviteDispatchResponse
from ...services.sms_service import SMSService

router = APIRouter()


@router.post("/send-invites", response_model=InviteDispatchResponse)
async def send_invites(
    payload: InviteDispatchRequest,
    current_user: User = Depends(get_current_active_user),
):
    sms_service = SMSService()
    sent = 0
    failed = 0

    for recipient in payload.recipients:
        message = (
            f"You've been invited to join '{payload.group_name}' Equb group. "
            f"Contribution: {payload.amount or 0} {payload.currency} {payload.frequency}. "
            f"Join now: {payload.group_link or 'DigiEqub app'} Use code: {payload.join_code}"
        )

        try:
            result = await sms_service.send_sms(recipient, message)
            if result.get('status') == 'sent':
                sent += 1
            else:
                failed += 1
        except Exception:
            failed += 1

    return InviteDispatchResponse(success=True, sent=sent, failed=failed, channel='sms')
