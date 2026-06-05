from pymongo import MongoClient
from datetime import datetime, timedelta

client = MongoClient("mongodb://localhost:27017/")
db = client["digiequb"]

# Check recent wallet transactions (last 24 hours)
yesterday = datetime.now() - timedelta(days=1)

print("Recent wallet transactions:")
wallet_txns = list(db["wallet_transactions"].find().sort("created_at", -1).limit(10))

for tx in wallet_txns:
    print(f"\nTransaction ID: {tx.get('_id')}")
    print(f"Reference: {tx.get('transaction_reference', 'N/A')}")
    print(f"Type: {tx.get('transaction_type', 'N/A')}")
    print(f"Amount: {tx.get('amount', 0)} ETB")
    print(f"Status: {tx.get('status', 'N/A')}")
    print(f"User ID: {tx.get('user_id', 'N/A')}")
    print(f"Created: {tx.get('created_at', 'N/A')}")

print("\n" + "="*50)
print("All collections in database:")
collections = db.list_collection_names()
for col in collections:
    count = db[col].count_documents({})
    print(f"{col}: {count} documents")

# Check if there are any transactions with similar reference pattern
print("\n" + "="*50)
print("Looking for RCP pattern transactions:")
rcp_txns = list(db["wallet_transactions"].find({"transaction_reference": {"$regex": "^RCP-"}}))
for tx in rcp_txns:
    print(f"Found: {tx.get('transaction_reference')} - {tx.get('amount')} ETB - {tx.get('status')}")