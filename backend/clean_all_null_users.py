# backend/clean_all_null_users.py
from pymongo import MongoClient

print("🔧 CONNECTING TO MONGODB...")
client = MongoClient('mongodb://localhost:27017')
db = client['digiequb']

print("\n📋 FINDING USERS WITH NULL PHONE NUMBER...")
null_users = list(db.users.find({"phone_number": None}))
print(f"Found {len(null_users)} users with null phone number")

if null_users:
    print("\n🗑️ DELETING ALL USERS WITH NULL PHONE NUMBER...")
    for user in null_users:
        print(f"   Deleting: {user.get('email')} - {user.get('full_name', 'No name')}")
        db.users.delete_one({"_id": user["_id"]})
    print(f"\n✅ Deleted {len(null_users)} users")
else:
    print("✅ No users with null phone number found")

# Verify
remaining = list(db.users.find({"phone_number": None}))
print(f"\n📋 Remaining users with null phone: {len(remaining)}")

# Show all remaining users
print("\n👥 REMAINING USERS:")
for user in db.users.find({}, {"full_name": 1, "email": 1, "phone_number": 1}):
    print(f"   - {user.get('full_name')}: {user.get('email')} | Phone: {user.get('phone_number')}")

client.close()
print("\n✅✅✅ CLEANUP COMPLETE! ✅✅✅")
print("Restart your backend: python run_dev.py")