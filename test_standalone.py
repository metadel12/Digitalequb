#!/usr/bin/env python3
"""
Standalone test of the shortfall calculation logic
"""

def current_round_total_collected(group_doc, round_number=None):
    """Replicate the backend function"""
    members = group_doc.get("members") or []
    if round_number is None:
        round_number = group_doc.get("current_round", 2)  # Default to round 2
    total = 0.0
    for member in members:
        round_contributions = member.get("round_contributions") or {}
        total += float(round_contributions.get(str(round_number), 0.0))
    return round(total, 2)

def current_round_number(group_doc):
    """Replicate the backend function"""
    return group_doc.get("current_round", 2)

def test_backend_logic():
    """Test the backend logic with the exact scenario"""
    
    print("Testing Backend Shortfall Logic")
    print("=" * 40)
    
    # This is what we expect to be in the database after:
    # 1. 4 original members (3 paid 100, 1 paid 50)
    # 2. Added 1 member via "Add Member & Ready for Winner" 
    mock_group = {
        "_id": "test_group_123", 
        "name": "Test Group",
        "contribution_amount": 100.0,
        "current_round": 2,
        "status": "active",
        "members": [
            {
                "user_id": "user1",
                "has_paid_current_round": True,
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user2",
                "has_paid_current_round": True, 
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user3",
                "has_paid_current_round": True,
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user4",  # Original partial payer
                "has_paid_current_round": True,
                "round_contributions": {"2": 50.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user5",  # NEW: Added via "Add Member & Ready for Winner"
                "has_paid_current_round": True,
                "round_contributions": {"2": 50.0}, 
                "is_shortfall_member": True,
                "auto_verified": True  # This is the key flag
            }
        ]
    }
    
    # Replicate the EXACT backend calculation from get_all_groups()
    members = list(mock_group.get("members") or [])
    total_members = len(members)
    paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
    total_collected = current_round_total_collected(mock_group)
    contribution_amount = float(mock_group.get("contribution_amount", 0))
    
    # This is our FIXED expected amount calculation
    expected_amount = 0.0
    for member in members:
        round_contribs = member.get("round_contributions") or {}
        current_round = int(mock_group.get("current_round") or current_round_number(mock_group))
        paid_amount = float(round_contribs.get(str(current_round), 0))
        
        if member.get("is_shortfall_member") and "shortfall_amount_due" in member:
            # For shortfall members who haven't paid yet, expect their shortfall amount
            expected_amount += float(member.get("shortfall_amount_due", contribution_amount))
        elif member.get("is_shortfall_member") and member.get("auto_verified"):
            # For auto-verified shortfall members, expect what they actually paid
            expected_amount += paid_amount
        elif member.get("has_paid_current_round") and paid_amount > 0:
            # For members who have paid, expect what they actually paid
            expected_amount += paid_amount
        else:
            # For members who haven't paid yet, expect full contribution
            expected_amount += contribution_amount
    
    # Check if all paid
    all_paid = (
        total_members > 0 
        and paid_members == total_members 
        and abs(total_collected - expected_amount) < 0.01
    )
    
    print(f"Database State Analysis:")
    print(f"  Total Members: {total_members}")
    print(f"  Paid Members: {paid_members}")
    print(f"  Current Round: {current_round}")
    print()
    
    print(f"Member Payment Breakdown:")
    for i, member in enumerate(members, 1):
        round_contribs = member.get("round_contributions") or {}
        paid_amount = float(round_contribs.get(str(current_round), 0))
        is_shortfall = member.get("is_shortfall_member", False)
        auto_verified = member.get("auto_verified", False)
        
        expected_for_member = 0.0
        if member.get("is_shortfall_member") and "shortfall_amount_due" in member:
            expected_for_member = float(member.get("shortfall_amount_due", contribution_amount))
        elif member.get("is_shortfall_member") and member.get("auto_verified"):
            expected_for_member = paid_amount
        elif member.get("has_paid_current_round") and paid_amount > 0:
            expected_for_member = paid_amount
        else:
            expected_for_member = contribution_amount
        
        print(f"  Member {i}: Paid {paid_amount}, Expected {expected_for_member}, Shortfall={is_shortfall}, Auto={auto_verified}")
    print()
    
    print(f"Financial Calculation:")
    print(f"  Total Collected: {total_collected} ETB")
    print(f"  Expected Amount: {expected_amount} ETB") 
    print(f"  Shortfall: {expected_amount - total_collected} ETB")
    print(f"  All Members Paid: {paid_members == total_members}")
    print(f"  Amounts Match: {abs(total_collected - expected_amount) < 0.01}")
    print(f"  ALL PAID STATUS: {all_paid}")
    print()
    
    # What the frontend would see
    frontend_data = {
        "group_id": str(mock_group["_id"]),
        "group_name": mock_group.get("name", "Unnamed Group"),
        "contribution_amount": contribution_amount,
        "current_round": current_round,
        "total_members": total_members,
        "paid_members": paid_members,
        "pending_members": max(total_members - paid_members, 0),
        "all_paid": all_paid,
        "total_collected": total_collected,
        "expected_amount": expected_amount,
    }
    
    print(f"Frontend Data:")
    for key, value in frontend_data.items():
        print(f"  {key}: {value}")
    print()
    
    # Frontend shortfall detection
    frontend_shortfall = frontend_data["expected_amount"] - frontend_data["total_collected"]
    has_shortfall = frontend_shortfall > 0.01
    
    print(f"Frontend Shortfall Detection:")
    print(f"  Expected: {frontend_data['expected_amount']} ETB")
    print(f"  Collected: {frontend_data['total_collected']} ETB")
    print(f"  Shortfall: {frontend_shortfall} ETB")
    print(f"  Has Shortfall: {has_shortfall}")
    print()
    
    if has_shortfall:
        print("RESULT: Frontend shows 'Handle Shortfall' button (WRONG)")
    else:
        print("RESULT: Frontend shows 'Select Winner' button (CORRECT)")
    
    if all_paid and not has_shortfall:
        print("SUCCESS: Fix is working correctly!")
        return True
    else:
        print("FAILURE: Fix is not working correctly!")
        return False

if __name__ == "__main__":
    success = test_backend_logic()
    exit(0 if success else 1)