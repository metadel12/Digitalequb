"""
Test shortfall handling: 350 collected vs 400 expected = 50 ETB shortfall
Scenario: Round 1, 4 members paid, but total only 350 ETB instead of 400 ETB
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8001/api/v1"
ADMIN_EMAIL = "metizomawa@gmail.com"
ADMIN_PASSWORD = "Admin@123456"

def get_auth_token() -> Optional[str]:
    """Get authentication token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"❌ Auth failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return None

def get_headers(token: str) -> dict:
    """Get request headers with auth"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def check_shortfall_status():
    """Check all groups for shortfall status"""
    token = get_auth_token()
    if not token:
        print("❌ Failed to authenticate")
        return None
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/groups",
            headers=get_headers(token),
            timeout=5
        )
        
        if response.status_code == 200:
            groups = response.json()
            print(f"\n📊 Checking {len(groups)} group(s) for shortfall...")
            
            for group in groups:
                group_id = group.get('group_id')
                group_name = group.get('group_name')
                expected = group.get('expected_amount', 0)
                collected = group.get('total_collected', 0)
                shortfall = max(0, expected - collected)
                paid_members = group.get('paid_members', 0)
                total_members = group.get('total_members', 0)
                all_paid = group.get('all_paid', False)
                current_round = group.get('current_round', 1)
                
                print(f"\n{'='*60}")
                print(f"Group: {group_name} (ID: {group_id})")
                print(f"Round: {current_round}")
                print(f"Members: {paid_members}/{total_members} paid")
                print(f"Expected: {expected} ETB")
                print(f"Collected: {collected} ETB")
                print(f"Shortfall: {shortfall} ETB")
                print(f"All Paid: {all_paid}")
                
                if shortfall > 0:
                    print(f"\n⚠️ SHORTFALL DETECTED!")
                    print(f"   Need {shortfall} ETB more to complete round")
                    print(f"   Current status: {'✅ Ready for winner' if all_paid else '❌ Handle Shortfall needed'}")
                    
                    # Check if this matches the user's scenario
                    if collected == 350 and expected == 400 and shortfall == 50:
                        print(f"\n🎯 THIS IS THE TARGET SCENARIO!")
                        print(f"   - 4 members paid → 350 ETB collected")
                        print(f"   - Expected 400 ETB")
                        print(f"   - Shortfall: 50 ETB")
                        return {
                            "group_id": group_id,
                            "group_name": group_name,
                            "shortfall": shortfall
                        }
                else:
                    print(f"   ✅ No shortfall - ready for winner selection")
            
            return None
        else:
            print(f"❌ API error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error checking groups: {e}")
        return None

def handle_shortfall(group_id: str, shortfall_amount: float, member_email: str):
    """Add a shortfall member to cover the gap"""
    token = get_auth_token()
    if not token:
        print("❌ Failed to authenticate")
        return False
    
    try:
        payload = {
            "group_id": group_id,
            "member_email": member_email,
            "shortfall_amount": shortfall_amount
        }
        
        print(f"\n📝 Adding shortfall member: {member_email}")
        print(f"   Amount due: {shortfall_amount} ETB")
        
        response = requests.post(
            f"{BASE_URL}/admin/add-member-for-shortfall",
            headers=get_headers(token),
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"   {data.get('message', 'Member added')}")
            return True
        else:
            print(f"❌ Failed to add shortfall member: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error handling shortfall: {e}")
        return False

def verify_shortfall_resolved(group_id: str):
    """Verify the shortfall was resolved"""
    token = get_auth_token()
    if not token:
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/groups",
            headers=get_headers(token),
            timeout=5
        )
        
        if response.status_code == 200:
            groups = response.json()
            for group in groups:
                if group.get('group_id') == group_id:
                    expected = group.get('expected_amount', 0)
                    collected = group.get('total_collected', 0)
                    shortfall = max(0, expected - collected)
                    total_members = group.get('total_members', 0)
                    paid_members = group.get('paid_members', 0)
                    
                    print(f"\n✓ Updated status:")
                    print(f"  Members: {paid_members}/{total_members}")
                    print(f"  Collected: {collected} ETB")
                    print(f"  Expected: {expected} ETB")
                    print(f"  Shortfall: {shortfall} ETB")
                    
                    return shortfall == 0
        
        return False
    except Exception as e:
        print(f"❌ Error verifying: {e}")
        return False

if __name__ == "__main__":
    print("🔍 TESTING SHORTFALL SCENARIO")
    print("="*60)
    print("Expected: 350 ETB collected vs 400 ETB target")
    print("Shortfall: 50 ETB")
    
    # Step 1: Check for shortfall
    shortfall_info = check_shortfall_status()
    
    if not shortfall_info:
        print("\n⚠️ Target scenario not found in database")
        print("Please create test data first, or check if backend is running on port 8001")
        exit(1)
    
    # Step 2: Handle the shortfall
    group_id = shortfall_info['group_id']
    shortfall_amount = shortfall_info['shortfall']
    
    # Use a new email for the shortfall member
    shortfall_member_email = f"shortfall-cover-{group_id[:8]}@digitequb.com"
    
    if handle_shortfall(group_id, shortfall_amount, shortfall_member_email):
        # Step 3: Verify resolution
        print("\n🔄 Verifying shortfall resolution...")
        if verify_shortfall_resolved(group_id):
            print("\n✅ SHORTFALL RESOLVED!")
            print("   Winner selection should now be available")
        else:
            print("\n⚠️ Shortfall member added but still pending payment")
    else:
        print("\n❌ Failed to handle shortfall")
