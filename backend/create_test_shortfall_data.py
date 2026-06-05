"""
Create test data for shortfall scenario testing
Scenario: Round 1, 4 members paid 350 ETB total (expected 400 ETB, shortfall 50 ETB)
"""

from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import json

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "digiequb_db"

def get_mongo_client():
    """Connect to MongoDB"""
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return client
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None

def new_id():
    """Generate new MongoDB ObjectId"""
    return ObjectId()

def utcnow():
    """Get current UTC datetime"""
    return datetime.utcnow()

def create_test_data():
    """Create test group with shortfall scenario"""
    client = get_mongo_client()
    if not client:
        return
    
    try:
        db = client[DB_NAME]
        
        print("🔧 Setting up test data...")
        
        # Clear existing test data
        db["groups"].delete_many({"name": "Test Ethio Eqube"})
        db["users"].delete_many({"email": {"$regex": "^test-member-"}})
        
        # Create or update admin user
        admin_result = db["users"].update_one(
            {"email": "metizomawa@gmail.com"},
            {"$set": {
                "email_verified": True,
                "updated_at": utcnow()
            }},
            upsert=False
        )
        
        # Get admin ID
        admin_doc = db["users"].find_one({"email": "metizomawa@gmail.com"})
        if admin_doc:
            admin_id = admin_doc["_id"]
        else:
            admin_id = new_id()
        
        print(f"✅ Admin user ready (ID: {admin_id})")
        
        # Create 4 members
        members = []
        member_emails = [
            "test-member-1@example.com",
            "test-member-2@example.com", 
            "test-member-3@example.com",
            "test-member-4@example.com"
        ]
        
        for i, email in enumerate(member_emails, 1):
            user_id = new_id()
            user = {
                "_id": user_id,
                "email": email,
                "full_name": f"Test Member {i}",
                "phone_number": f"+251911{i:06d}",
                "is_admin": False,
                "email_verified": True,
                "created_at": utcnow()
            }
            db["users"].update_one(
                {"email": email},
                {"$set": user},
                upsert=True
            )
            
            # Create member entry for group
            # Each member pays 87.5 ETB (total 350 / 4 members)
            member_doc = {
                "user_id": str(user_id),
                "full_name": f"Test Member {i}",
                "email": email,
                "phone": f"+251911{i:06d}",
                "joined_at": utcnow(),
                "has_paid_current_round": True,  # Already paid
                "payment_verified_at": utcnow(),
                "total_contributed": 87.5,
                "round_contributions": {
                    "1": 87.5  # Paid 87.5 in round 1
                },
                "is_shortfall_member": False,
                "position": i
            }
            members.append(member_doc)
        
        print(f"✅ Created 4 test members")
        
        # Create group
        group_id = new_id()
        group = {
            "_id": group_id,
            "name": "Test Ethio Eqube",
            "description": "Test group for shortfall scenario",
            "admin_id": str(admin_id),
            "members": members,
            "contribution_amount": 100.0,  # 100 ETB per member expected = 400 total
            "total_members": 4,
            "current_round": 1,
            "round_status": {
                "1": {
                    "completed": False,
                    "winner_id": None,
                    "winner_amount": None
                }
            },
            "status": "active",
            "created_at": utcnow(),
            "updated_at": utcnow()
        }
        
        db["groups"].insert_one(group)
        print(f"✅ Created group: Test Ethio Eqube")
        
        # Verify the data
        group_check = db["groups"].find_one({"_id": group_id})
        if group_check:
            print("\n📊 Shortfall Scenario Created:")
            print("="*60)
            
            total_collected = sum(m.get("round_contributions", {}).get("1", 0) for m in members)
            expected = 100 * 4
            shortfall = expected - total_collected
            
            print(f"  Group ID: {group_id}")
            print(f"  Round: 1")
            print(f"  Members: 4/4 paid")
            print(f"  Contribution per member: 100 ETB")
            print(f"  Expected total: {expected} ETB")
            print(f"  Actually collected: {total_collected} ETB")
            print(f"  ⚠️ SHORTFALL: {shortfall} ETB")
            print("="*60)
            
            print("\n✅ Test data created successfully!")
            print("\nNext step: python backend/test_shortfall_scenario.py")
        
    finally:
        client.close()

if __name__ == "__main__":
    print("🔧 Creating test data for shortfall scenario")
    print("="*60)
    create_test_data()
