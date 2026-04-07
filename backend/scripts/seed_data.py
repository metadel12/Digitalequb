#!/usr/bin/env python3
"""
Seed test data script
"""
import asyncio
from app.core.database import get_database, connect_to_mongo, close_mongo_connection
from app.services.auth_service import AuthService

async def seed_data():
    await connect_to_mongo()
    db = await get_database()

    # Create test users
    auth_service = AuthService(db)
    test_users = [
        {
            "email": "admin@digiequb.com",
            "full_name": "Admin User",
            "phone_number": "+1234567890",
            "password": "admin123",
            "is_admin": True
        },
        {
            "email": "user@example.com",
            "full_name": "Test User",
            "phone_number": "+1234567891",
            "password": "user123",
            "is_admin": False
        }
    ]

    for user_data in test_users:
        try:
            user = await auth_service.register_user(user_data)
            print(f"Created user: {user.email}")
        except Exception as e:
            print(f"User {user_data['email']} already exists: {e}")

    print("Seeding completed")

if __name__ == "__main__":
    asyncio.run(seed_data())