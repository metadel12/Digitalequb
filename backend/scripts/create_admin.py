#!/usr/bin/env python3
"""
Create admin user script
"""
import asyncio
from app.core.database import get_database, connect_to_mongo, close_mongo_connection
from app.services.auth_service import AuthService

async def create_admin():
    await connect_to_mongo()
    db = await get_database()

    auth_service = AuthService(db)
    admin_data = {
        "email": "admin@digiequb.com",
        "full_name": "System Admin",
        "phone_number": "+1234567890",
        "password": "admin123",
        "is_admin": True
    }

    try:
        user = await auth_service.register_user(admin_data)
        print(f"Admin user created: {user.email}")
    except Exception as e:
        print(f"Admin user creation failed: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin())