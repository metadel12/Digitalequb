from datetime import datetime
from app.models.user import UserInDB, User, UserUpdate
from app.utils.security import get_password_hash

class UserService:
    def __init__(self, db):
        self.db = db

    async def get_user_by_id(self, user_id: str) -> User:
        user = await self.db.users.find_one({"_id": user_id})
        if not user:
            return None
        return User(**user)

    async def update_user(self, user_id: str, update_data: UserUpdate) -> User:
        update_dict = update_data.dict(exclude_unset=True)
        if 'password' in update_dict:
            update_dict['hashed_password'] = get_password_hash(update_dict.pop('password'))
        update_dict['updated_at'] = datetime.utcnow()

        result = await self.db.users.update_one(
            {"_id": user_id},
            {"$set": update_dict}
        )
        if result.modified_count == 0:
            raise ValueError("User not found or no changes made")

        return await self.get_user_by_id(user_id)

    async def get_all_users(self) -> list[User]:
        users = []
        async for user in self.db.users.find():
            users.append(User(**user))
        return users