#!/usr/bin/env python3
"""
Database initialization script
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

async def init_database():
    await connect_to_mongo()
    # Create indexes if needed
    print("Database initialized successfully")

if __name__ == "__main__":
    asyncio.run(init_database())