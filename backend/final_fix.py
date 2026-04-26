# backend/final_fix.py
from pymongo import MongoClient

print("🔧 CONNECTING TO MONGODB...")
client = MongoClient('mongodb://localhost:27017')
db = client['digiequb']

print("📋 CURRENT INDEXES BEFORE FIX:")
for idx in db.users.list_indexes():
    print(f"   - {idx['name']}: unique={idx.get('unique', False)}, sparse={idx.get('sparse', False)}")

print("\n🗑️ DROPPING OLD phone_number_1 INDEX...")
try:
    db.users.drop_index("phone_number_1")
    print("✅ Dropped index: phone_number_1")
except Exception as e:
    print(f"⚠️ {e}")

print("\n🗑️ DROPPING ANY OTHER phone_number INDEXES...")
try:
    db.users.drop_index("phone_number")
    print("✅ Dropped index: phone_number")
except:
    pass

try:
    db.users.drop_index("phone_number_sparse")
    print("✅ Dropped index: phone_number_sparse")
except:
    pass

print("\n🔧 CREATING CORRECT INDEX (unique + sparse)...")
db.users.create_index(
    [("phone_number", 1)],
    unique=True,
    sparse=True,
    name="phone_number_sparse"
)
print("✅ Created index: phone_number_sparse (unique=true, sparse=true)")

print("\n📋 FINAL INDEXES AFTER FIX:")
for idx in db.users.list_indexes():
    unique = idx.get('unique', False)
    sparse = idx.get('sparse', False)
    print(f"   - {idx['name']}: unique={unique}, sparse={sparse}")

print("\n🧹 CLEANING UP DUPLICATE NULL PHONE NUMBERS...")
# Find users with null phone
null_users = list(db.users.find({"phone_number": None}))
if len(null_users) > 1:
    print(f"Found {len(null_users)} users with null phone number")
    # Keep the first, delete others
    for user in null_users[1:]:
        db.users.delete_one({"_id": user["_id"]})
        print(f"   Deleted duplicate user: {user.get('email')}")
else:
    print("No duplicate null phone numbers found")

client.close()
print("\n✅✅✅ FIX COMPLETE! ✅✅✅")
print("Restart your backend: python run_dev.py")