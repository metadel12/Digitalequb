# backend/clean_duplicates.py
from pymongo import MongoClient

print("🔧 CONNECTING TO MONGODB...")
client = MongoClient('mongodb://localhost:27017')
db = client['digiequb']

print("\n📋 FINDING ALL USERS...")
all_users = list(db.users.find({}))
print(f"Total users: {len(all_users)}")

print("\n📋 FINDING USERS WITH NULL PHONE NUMBER...")
null_users = list(db.users.find({"phone_number": None}))
print(f"Users with null phone: {len(null_users)}")

if len(null_users) > 1:
    print(f"\n🗑️ DELETING {len(null_users) - 1} DUPLICATE USERS...")
    # Keep the first one, delete all others
    for user in null_users[1:]:
        result = db.users.delete_one({"_id": user["_id"]})
        print(f"   Deleted: {user.get('email')} - {user.get('full_name', 'No name')}")
    print(f"\n✅ Deleted {len(null_users) - 1} duplicate users")
else:
    print("\n✅ No duplicate null phone users found")

# Also check for any users with duplicate emails
print("\n📋 CHECKING FOR DUPLICATE EMAILS...")
emails = {}
duplicate_emails = []
for user in all_users:
    email = user.get("email")
    if email in emails:
        duplicate_emails.append(user)
    else:
        emails[email] = user

if duplicate_emails:
    print(f"Found {len(duplicate_emails)} duplicate emails, deleting...")
    for user in duplicate_emails:
        db.users.delete_one({"_id": user["_id"]})
        print(f"   Deleted duplicate: {user.get('email')}")

# Show remaining users
print("\n👥 REMAINING USERS:")
for user in db.users.find({}, {"full_name": 1, "email": 1, "phone_number": 1}):
    print(f"   - {user.get('full_name')}: {user.get('email')} | Phone: {user.get('phone_number')}")

print("\n✅✅✅ CLEANUP COMPLETE! ✅✅✅")
print("Restart your backend: python run_dev.py")

client.close()