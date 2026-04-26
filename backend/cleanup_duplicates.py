# backend/cleanup_duplicates.py
from pymongo import MongoClient

print("🔧 CLEANING UP DUPLICATE NULL PHONE NUMBERS...")

client = MongoClient('mongodb://localhost:27017')
db = client['digiequb']

# Find all users with null phone number
null_users = list(db.users.find({"phone_number": None}))
print(f"Found {len(null_users)} users with null phone number")

if len(null_users) > 1:
    # Keep the first one, delete all others
    for user in null_users[1:]:
        result = db.users.delete_one({"_id": user["_id"]})
        print(f"   Deleted: {user.get('email')} - {user.get('full_name', 'No name')}")
    print(f"\n✅ Deleted {len(null_users) - 1} duplicate users")
else:
    print("✅ No duplicate null phone numbers found")

# Verify remaining users
remaining = list(db.users.find({"phone_number": None}))
print(f"\n📋 Remaining users with null phone: {len(remaining)}")

client.close()
print("\n✅ DONE! Restart your backend: python run_dev.py")