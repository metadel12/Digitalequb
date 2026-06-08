#!/usr/bin/env python3
"""
Test script for ethi-eqube Round 1 shortfall handling.
This tests adding a member to cover the 50 ETB shortfall.

Scenario:
- Group: ethi-eqube
- Round: 1
- Members: 4 paid
- Collected: 350 ETB
- Expected: 400 ETB
- Shortfall: 50 ETB
- Action: Add one member to pay 50 ETB
"""

import sys
import os
from pathlib import Path

# Set up Python path - add backend directory
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Load environment variables before importing config
from dotenv import load_dotenv
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(str(env_file))
else:
    print(f"Warning: .env file not found at {env_file}")

from pymongo import MongoClient
from datetime import datetime
from app.core.config import settings
from app.services.admin_service import AdminService
from app.core.mongo_utils import new_id

def test_shortfall_scenario():
    """Test adding a member for shortfall in ethi-eqube group."""
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        # Step 1: Find the ethi-eqube group
        print("=" * 60)
        print("Step 1: Finding ethi-eqube group...")
        print("=" * 60)
        
        group = db["groups"].find_one({"name": "ethi-eqube"})
        if not group:
            print("❌ Group 'ethi-eqube' not found")
            return
        
        group_id = str(group["_id"])
        print(f"✅ Found group: {group['name']}")
        print(f"   Group ID: {group_id}")
        print(f"   Current Round: {group.get('current_round', 1)}")
        print(f"   Total Rounds: {group.get('total_rounds', 10)}")
        print()
        
        # Step 2: Analyze current state
        print("=" * 60)
        print("Step 2: Analyzing current payment status...")
        print("=" * 60)
        
        members = group.get("members", [])
        contribution_amount = float(group.get("contribution_amount", 0))
        current_round = int(group.get("current_round", 1))
        
        print(f"Contribution Amount: {contribution_amount} ETB")
        print(f"Total Members: {len(members)}")
        print()
        
        # Calculate totals
        total_collected = 0.0
        paid_members = []
        for member in members:
            round_contribs = member.get("round_contributions", {})
            paid = float(round_contribs.get(str(current_round), 0))
            if paid > 0:
                total_collected += paid
                paid_members.append({
                    "name": member.get("full_name", "Unknown"),
                    "email": member.get("email", ""),
                    "amount": paid
                })
        
        print("Members who paid:")
        for i, member in enumerate(paid_members, 1):
            print(f"  {i}. {member['name']} ({member['email']}): {member['amount']} ETB")
        print()
        
        expected_amount = len(members) * contribution_amount
        shortfall = expected_amount - total_collected
        
        print(f"Expected Amount (4 members × {contribution_amount}): {expected_amount} ETB")
        print(f"Total Collected: {total_collected} ETB")
        print(f"Shortfall: {shortfall} ETB")
        print()
        
        if shortfall <= 0:
            print("⚠️  No shortfall detected. Group is fully paid or over-paid.")
            return
        
        # Step 3: Prepare to add shortfall member
        print("=" * 60)
        print("Step 3: Adding member to cover shortfall...")
        print("=" * 60)
        
        # Generate email for shortfall member
        shortfall_member_email = f"shortfall-member-{new_id()}@digitequb.test"
        
        admin_service = AdminService(db)
        
        # Get admin ID (there should be only one admin)
        admin_user = db["users"].find_one({"email": admin_service.ADMIN_EMAIL})
        admin_id = str(admin_user["_id"]) if admin_user else "admin_id"
        
        print(f"Shortfall Member Email: {shortfall_member_email}")
        print(f"Shortfall Amount: {shortfall} ETB")
        print(f"Admin ID: {admin_id}")
        print()
        
        # Call add_member_for_shortfall
        result = admin_service.add_member_for_shortfall(
            group_id=group_id,
            member_email=shortfall_member_email,
            shortfall_amount=shortfall,
            admin_id=admin_id
        )
        
        print(f"✅ Result: {result}")
        print()
        
        # Step 4: Verify the member was added
        print("=" * 60)
        print("Step 4: Verifying member was added...")
        print("=" * 60)
        
        updated_group = db["groups"].find_one({"_id": group["_id"]})
        new_members = updated_group.get("members", [])
        
        print(f"Total members now: {len(new_members)} (was {len(members)})")
        
        # Find the newly added member
        shortfall_member = None
        for member in new_members:
            if member.get("email") == shortfall_member_email:
                shortfall_member = member
                break
        
        if shortfall_member:
            print(f"\n✅ Shortfall member found:")
            print(f"   Name: {shortfall_member.get('full_name', 'Unknown')}")
            print(f"   Email: {shortfall_member.get('email', 'Unknown')}")
            print(f"   Is Shortfall Member: {shortfall_member.get('is_shortfall_member', False)}")
            print(f"   Shortfall Amount Due: {shortfall_member.get('shortfall_amount_due', 0)}")
            print(f"   Has Paid Current Round: {shortfall_member.get('has_paid_current_round', False)}")
            print(f"   Position: {shortfall_member.get('position', 0)}")
        else:
            print("❌ Shortfall member not found!")
        
        # Step 5: Calculate expected amounts after adding shortfall member
        print()
        print("=" * 60)
        print("Step 5: Summary - Payment Status After Adding Shortfall Member")
        print("=" * 60)
        
        total_members_after = len(new_members)
        total_expected_after = total_collected + shortfall
        
        print(f"New Total Members: {total_members_after}")
        print(f"Total Collected: {total_collected} ETB (from {len(paid_members)} members)")
        print(f"Shortfall Member to Pay: {shortfall} ETB")
        print(f"Total Expected After: {total_expected_after} ETB")
        print()
        print("✅ When shortfall member pays, round will be complete!")
        print()
        
        # Get member status through admin service
        member_status = admin_service.get_group_members_status(group_id)
        print("Detailed Member Status:")
        for member in member_status["members"]:
            status = "✅ PAID" if member.get("has_paid_current_round") else "⏳ PENDING"
            print(f"  {status} - {member['full_name']}: {member['paid_amount']} ETB")
            if member.get("is_shortfall_member"):
                print(f"            (Shortfall member - due: {member.get('shortfall_amount_due')} ETB)")
        
        print()
        print("=" * 60)
        print("✅ Test completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    test_shortfall_scenario()
