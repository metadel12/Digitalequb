#!/usr/bin/env python3
"""
Script to remove all groups from MongoDB
"""

import os
import sys
from pymongo import MongoClient

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import get_database_instance

def remove_all_groups():
    try:
        # Connect to database
        db = get_database_instance()

        # Count groups before deletion
        group_count = db["groups"].count_documents({})
        print(f"Found {group_count} groups in the database")

        # Delete all groups
        result = db["groups"].delete_many({})
        print(f"Deleted {result.deleted_count} groups")

        # Also clean up related collections that might reference groups
        # Delete round_payments
        round_payments_count = db["round_payments"].delete_many({}).deleted_count
        print(f"Deleted {round_payments_count} round payments")

        # Delete group-related transactions from wallet_transactions
        wallet_tx_count = db["wallet_transactions"].delete_many({"group_id": {"$exists": True}}).deleted_count
        print(f"Deleted {wallet_tx_count} wallet transactions related to groups")

        # Verify groups collection is empty
        remaining_groups = db["groups"].count_documents({})
        print(f"Remaining groups: {remaining_groups}")

        print("Group cleanup completed successfully!")

    except Exception as e:
        print(f"Error during cleanup: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    remove_all_groups()