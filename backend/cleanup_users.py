#!/usr/bin/env python3
"""
Script to clean up users in MongoDB:
- Keep only the admin user metizomawa@gmail.com
- Update admin name to "bekele melese"
- Delete all other users
"""

import os
import sys
from pymongo import MongoClient
from pymongo.database import Database

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import get_database_instance

def cleanup_users():
    try:
        # Connect to database
        db = get_database_instance()

        # Find the admin user
        admin_email = "metizomawa@gmail.com"
        admin_user = db["users"].find_one({"email": admin_email})

        if not admin_user:
            print(f"Admin user {admin_email} not found!")
            return

        print(f"Found admin user: {admin_user}")

        # Update admin name and ensure admin role
        update_data = {
            "full_name": "bekele melese",
            "role": "admin"  # Ensure admin role
        }

        db["users"].update_one(
            {"_id": admin_user["_id"]},
            {"$set": update_data}
        )

        print(f"Updated admin user name to 'bekele melese' and role to 'admin'")

        # Delete all other users
        result = db["users"].delete_many({"email": {"$ne": admin_email}})
        print(f"Deleted {result.deleted_count} other users")

        # Verify only admin remains
        remaining_users = list(db["users"].find({}, {"email": 1, "full_name": 1, "role": 1}))
        print(f"Remaining users: {remaining_users}")

        print("User cleanup completed successfully!")

    except Exception as e:
        print(f"Error during cleanup: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    cleanup_users()