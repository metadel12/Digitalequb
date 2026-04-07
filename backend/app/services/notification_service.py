from datetime import datetime
from app.models.notification import NotificationInDB, Notification, NotificationCreate, NotificationUpdate
from app.services.email_service import EmailService
from app.services.sms_service import SMSService

class NotificationService:
    def __init__(self, db):
        self.db = db
        self.email_service = EmailService()
        self.sms_service = SMSService()

    async def create_notification(self, notification: NotificationCreate) -> Notification:
        notif_doc = NotificationInDB(**notification.dict())
        result = await self.db.notifications.insert_one(notif_doc.dict(by_alias=True))
        notif_doc.id = result.inserted_id
        # Send notification
        await self.send_notification(Notification(**notif_doc.dict()))
        return Notification(**notif_doc.dict())

    async def get_notification_by_id(self, notification_id: str) -> Notification:
        notif = await self.db.notifications.find_one({"_id": notification_id})
        if not notif:
            return None
        return Notification(**notif)

    async def get_user_notifications(self, user_id: str) -> list[Notification]:
        notifications = []
        async for notif in self.db.notifications.find({"user_id": user_id}):
            notifications.append(Notification(**notif))
        return notifications

    async def update_notification(self, notification_id: str, update_data: NotificationUpdate) -> Notification:
        update_dict = update_data.dict(exclude_unset=True)
        if update_data.status == "sent":
            update_dict['sent_at'] = datetime.utcnow()
        result = await self.db.notifications.update_one(
            {"_id": notification_id},
            {"$set": update_dict}
        )
        if result.modified_count == 0:
            raise ValueError("Notification not found or no changes made")
        return await self.get_notification_by_id(notification_id)

    async def send_notification(self, notification: Notification):
        if notification.type == "email":
            await self.email_service.send_email(notification.recipient, notification.subject, notification.message)
        elif notification.type == "sms":
            await self.sms_service.send_sms(notification.recipient, notification.message)
        # Update status
        await self.update_notification(notification.id, NotificationUpdate(status="sent"))