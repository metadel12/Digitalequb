"""
Quick script to add address data to a user
"""
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['digiequb']

# User email
user_email = "bekitamrat871@gmail.com"

# Address data to add
address_data = {
    "street": "Bole Road, Near Edna Mall",
    "city": "Addis Ababa",
    "country": "Ethiopia",
    "postal_code": "1000"
}

# Update the user
result = db.users.update_one(
    {"email": user_email},
    {"$set": {"address": address_data}}
)

if result.modified_count > 0:
    print(f"✅ Address added successfully for {user_email}")
    print(f"Address: {address_data}")
    
    # Verify
    user = db.users.find_one({"email": user_email}, {"full_name": 1, "address": 1})
    print(f"\nVerified - User: {user.get('full_name')}")
    print(f"Address in DB: {user.get('address')}")
else:
    print(f"❌ Failed to update user or user not found")

client.close()
