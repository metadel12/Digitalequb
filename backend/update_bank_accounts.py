#!/usr/bin/env python3
"""
Script to update existing user bank accounts from BOA to CBE
"""

import os
import sys
from pymongo import MongoClient

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import get_database_instance

def update_bank_accounts():
    try:
        # Connect to database
        db = get_database_instance()

        # Update all users with bank_account to use CBE
        result = db["users"].update_many(
            {"bank_account.bank_name": "Bank of Abyssinia"},
            {"$set": {"bank_account.bank_name": "Commercial Bank of Ethiopia"}}
        )

        print(f"Updated {result.modified_count} user bank accounts from BOA to CBE")

        # Check if there are any BOA accounts in the old collection
        old_collection = db["boa_accounts"]
        if old_collection.count_documents({}) > 0:
            # Move accounts to new collection
            accounts = list(old_collection.find({}))
            if accounts:
                new_collection = db["cbe_accounts"]
                for account in accounts:
                    # Update bank name in account
                    account["bank_name"] = "Commercial Bank of Ethiopia"
                    new_collection.replace_one({"_id": account["_id"]}, account, upsert=True)
                print(f"Moved {len(accounts)} accounts from boa_accounts to cbe_accounts")
                # Optionally drop old collection
                # old_collection.drop()

        print("Bank account update completed successfully!")

    except Exception as e:
        print(f"Error during update: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    update_bank_accounts()