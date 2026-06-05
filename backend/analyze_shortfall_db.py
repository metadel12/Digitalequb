"""
Direct database test for shortfall handling (bypasses auth)
Tests the scenario: 350 ETB collected vs 400 ETB expected = 50 ETB shortfall
"""

from pymongo import MongoClient
from datetime import datetime
from typing import Optional, Dict, Any
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

def format_currency(amount):
    """Format as ETB currency"""
    return f"{amount:.2f} ETB"

def analyze_shortfall():
    """Analyze groups for shortfall"""
    client = get_mongo_client()
    if not client:
        return
    
    try:
        db = client[DB_NAME]
        groups = db["groups"].find()
        
        shortfall_scenarios = []
        
        print("\n📊 Analyzing all groups for shortfall scenarios...")
        print("="*70)
        
        for group in groups:
            group_id = str(group["_id"])
            group_name = group.get("name", "Unnamed")
            members = list(group.get("members") or [])
            contribution_amount = float(group.get("contribution_amount", 0))
            current_round = int(group.get("current_round", 1))
            
            if not members:
                continue
            
            # Calculate totals from database directly
            total_members = len(members)
            
            # Get round 1 total (baseline)
            round1_total = 0.0
            for member in members:
                round_contribs = member.get("round_contributions") or {}
                round1_total += float(round_contribs.get("1", 0))
            
            # Get current round total
            current_total = 0.0
            paid_count = 0
            for member in members:
                if member.get("has_paid_current_round"):
                    paid_count += 1
                    round_contribs = member.get("round_contributions") or {}
                    current_total += float(round_contribs.get(str(current_round), 0))
            
            # Calculate expected for current round
            if current_round == 1:
                expected = round1_total if round1_total > 0 else total_members * contribution_amount
            else:
                expected = round1_total if round1_total > 0 else total_members * contribution_amount
            
            shortfall = max(0, expected - current_total)
            
            print(f"\n{'─'*70}")
            print(f"Group: {group_name}")
            print(f"  Group ID: {group_id}")
            print(f"  Round: {current_round}")
            print(f"  Members: {paid_count}/{total_members} paid")
            print(f"  Contribution per member: {format_currency(contribution_amount)}")
            print(f"\n  Expected: {format_currency(expected)}")
            print(f"  Collected: {format_currency(current_total)}")
            if shortfall > 0:
                print(f"  ⚠️ SHORTFALL: {format_currency(shortfall)}")
                shortfall_scenarios.append({
                    "group_id": group_id,
                    "group_name": group_name,
                    "shortfall": shortfall,
                    "expected": expected,
                    "collected": current_total,
                    "round": current_round,
                    "paid_members": paid_count,
                    "total_members": total_members
                })
            else:
                print(f"  ✅ No shortfall")
        
        # Find target scenario
        print("\n" + "="*70)
        print("🎯 Looking for target scenario: 350 collected, 400 expected, 50 shortfall")
        
        target = None
        for scenario in shortfall_scenarios:
            if scenario["collected"] == 350 and scenario["expected"] == 400 and scenario["shortfall"] == 50:
                target = scenario
                print(f"\n✅ FOUND TARGET SCENARIO!")
                print(f"   Group: {scenario['group_name']}")
                print(f"   Round: {scenario['round']}")
                print(f"   Collected: {format_currency(scenario['collected'])}")
                print(f"   Expected: {format_currency(scenario['expected'])}")
                print(f"   Shortfall: {format_currency(scenario['shortfall'])}")
                break
        
        if not target and shortfall_scenarios:
            print(f"\n⚠️ Target scenario not found, but found {len(shortfall_scenarios)} shortfall scenario(s):")
            for i, scenario in enumerate(shortfall_scenarios, 1):
                print(f"\n  {i}. {scenario['group_name']}")
                print(f"     Collected: {format_currency(scenario['collected'])} / Expected: {format_currency(scenario['expected'])}")
                print(f"     Shortfall: {format_currency(scenario['shortfall'])}")
        elif not shortfall_scenarios:
            print("\n⚠️ No shortfall scenarios found in database")
            print("   Tip: Create test data or ensure backend has processed payments")
        
        return target
        
    finally:
        client.close()

def show_admin_accounts():
    """Show available admin accounts in database"""
    client = get_mongo_client()
    if not client:
        return
    
    try:
        db = client[DB_NAME]
        admins = list(db["users"].find({"is_admin": True}, {"_id": 1, "email": 1, "is_admin": 1, "email_verified": 1}))
        
        if admins:
            print(f"\n👤 Found {len(admins)} admin account(s):")
            for admin in admins:
                status = "✓ Verified" if admin.get("email_verified") else "✗ Not Verified"
                print(f"   Email: {admin['email']} ({status})")
        else:
            print("\n✗ No admin accounts found")
            
    finally:
        client.close()

def verify_admin_email():
    """Verify the system admin email for testing"""
    client = get_mongo_client()
    if not client:
        return False
    
    try:
        db = client[DB_NAME]
        result = db["users"].update_one(
            {"email": "metizomawa@gmail.com"},
            {"$set": {"email_verified": True, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count > 0:
            print("\n✅ Admin email verified for testing")
            return True
        else:
            print("\n⚠️ Admin email not found or already verified")
            return False
            
    finally:
        client.close()

if __name__ == "__main__":
    print("🔍 SHORTFALL SCENARIO ANALYSIS (Direct Database)")
    print("="*70)
    
    # Show available admins first
    show_admin_accounts()
    
    # Try to verify admin for API testing
    print("\n🔐 Preparing admin account for API testing...")
    verify_admin_email()
    
    # Analyze shortfall scenarios
    target = analyze_shortfall()
    
    if target:
        print("\n" + "="*70)
        print("✅ Ready to handle shortfall!")
        print(f"   Run: python backend/test_shortfall_api.py to add shortfall member")
