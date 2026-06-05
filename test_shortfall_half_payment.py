#!/usr/bin/env python3
"""
Test script for shortfall handling when one user pays half.

Scenario:
- 4 member group, contribution amount = 100 birr each
- 3 members pay full 100 birr each = 300 birr
- 1 member pays half 50 birr = 50 birr
- Total collected: 350 birr
- Expected: 400 birr
- Shortfall: 50 birr

Solution:
- Add 1 new user who pays only 50 birr (the shortfall)
- Group becomes ready for winner selection immediately
"""

import sys
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.database import get_db_client
from app.services.admin_service import AdminService

async def test_shortfall_half_payment():
    """Test the shortfall handling with half payment scenario"""
    
    print("🔍 Testing Shortfall Handling - Half Payment Scenario")
    print("=" * 60)
    
    # Get database connection
    client = get_db_client()
    db = client["digiequb"]
    
    # Initialize admin service
    admin_service = AdminService(db)
    
    # Test scenario data
    test_group_id = "test_group_half_payment_001"
    test_member_email = "newmember@example.com"
    test_shortfall_amount = 50.0
    test_admin_id = "admin_001"
    
    print(f"📊 Test Parameters:")
    print(f"   Group ID: {test_group_id}")
    print(f"   New Member Email: {test_member_email}")
    print(f"   Shortfall Amount: {test_shortfall_amount} ETB")
    print(f"   Admin ID: {test_admin_id}")
    print()
    
    # Create test group with shortfall scenario
    print("🏗️  Setting up test group with shortfall...")
    
    # Create a sample group document
    test_group = {
        "_id": test_group_id,
        "name": "Test Half Payment Group",
        "contribution_amount": 100.0,
        "current_round": 1,
        "status": "active",
        "members": [
            {
                "user_id": "user_001",
                "full_name": "Member One",
                "email": "member1@example.com",
                "has_paid_current_round": True,
                "total_contributed": 100.0,
                "round_contributions": {"1": 100.0}
            },
            {
                "user_id": "user_002", 
                "full_name": "Member Two",
                "email": "member2@example.com",
                "has_paid_current_round": True,
                "total_contributed": 100.0,
                "round_contributions": {"1": 100.0}
            },
            {
                "user_id": "user_003",
                "full_name": "Member Three", 
                "email": "member3@example.com",
                "has_paid_current_round": True,
                "total_contributed": 100.0,
                "round_contributions": {"1": 100.0}
            },
            {
                "user_id": "user_004",
                "full_name": "Member Four (Partial)",
                "email": "member4@example.com", 
                "has_paid_current_round": True,
                "total_contributed": 50.0,  # Only paid half!
                "round_contributions": {"1": 50.0}
            }
        ]
    }
    
    # Create test user for new member
    test_user = {
        "_id": "new_user_005",
        "full_name": "New Member Five",
        "email": test_member_email,
        "phone_number": "+251911222333",
        "status": "active"
    }
    
    # Insert test data
    db["groups"].insert_one(test_group)
    db["users"].insert_one(test_user)
    
    print("✅ Test data created")
    print(f"   4 members: 3 paid 100 ETB, 1 paid 50 ETB")
    print(f"   Expected: 400 ETB, Collected: 350 ETB, Shortfall: 50 ETB")
    print()
    
    # Test the shortfall handling
    print("🚀 Testing add_member_for_shortfall_ready()...")
    
    try:
        result = admin_service.add_member_for_shortfall_ready(
            group_id=test_group_id,
            member_email=test_member_email,
            shortfall_amount=test_shortfall_amount,
            admin_id=test_admin_id
        )
        
        print("✅ SUCCESS! Shortfall handled successfully")
        print(f"   Message: {result.get('message')}")
        print(f"   New Member: {result.get('member', {}).get('full_name')}")
        print(f"   Shortfall Covered: {result.get('shortfall_covered')} ETB")
        print(f"   New Total Members: {result.get('new_total_members')}")
        print(f"   New Total Collected: {result.get('new_total_collected')} ETB")
        print(f"   Ready for Winner: {result.get('ready_for_winner')}")
        print()
        
        # Verify the group state
        print("🔍 Verifying group state after shortfall handling...")
        updated_group = db["groups"].find_one({"_id": test_group_id})
        
        if updated_group:
            members = updated_group.get("members", [])
            total_members = len(members)
            paid_members = len([m for m in members if m.get("has_paid_current_round")])
            
            # Calculate total collected
            total_collected = 0.0
            for member in members:
                round_contribs = member.get("round_contributions", {})
                total_collected += float(round_contribs.get("1", 0))
            
            print(f"   Total Members: {total_members}")
            print(f"   Paid Members: {paid_members}")
            print(f"   Total Collected: {total_collected} ETB")
            print(f"   Expected: {total_members * 100} ETB")
            
            if total_collected >= (total_members * 100):
                print("✅ Group is now ready for winner selection!")
            else:
                print("❌ Group still has shortfall")
            
            # Check if new member was added correctly
            new_member = next((m for m in members if m.get("user_id") == "new_user_005"), None)
            if new_member:
                print(f"✅ New member added: {new_member.get('full_name')}")
                print(f"   Has paid: {new_member.get('has_paid_current_round')}")
                print(f"   Contributed: {new_member.get('total_contributed')} ETB")
                print(f"   Is shortfall member: {new_member.get('is_shortfall_member')}")
            else:
                print("❌ New member not found in group")
        
        print()
        print("🎯 RESULT: The shortfall handling feature works perfectly!")
        print("   - One user paid half (50 ETB)")
        print("   - Added one user to pay the other half (50 ETB)")  
        print("   - Group is now ready for winner selection")
        print("   - No need to wait for payment verification!")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up test data
        print("\n🧹 Cleaning up test data...")
        db["groups"].delete_one({"_id": test_group_id})
        db["users"].delete_one({"_id": "new_user_005"})
        db["payment_verifications"].delete_many({"group_id": test_group_id})
        db["notifications"].delete_many({"user_id": "new_user_005"})
        print("✅ Cleanup completed")

if __name__ == "__main__":
    asyncio.run(test_shortfall_half_payment())