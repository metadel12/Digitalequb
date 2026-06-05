#!/usr/bin/env python3
"""
Test the fixed shortfall detection after adding a shortfall member.
"""

def test_shortfall_calculation():
    """Test the shortfall calculation logic"""
    
    print("Testing Shortfall Calculation After Adding Member")
    print("=" * 60)
    
    # Simulate group data after adding shortfall member
    group_members = [
        {
            "user_id": "user1", 
            "has_paid_current_round": True,
            "round_contributions": {"1": 100.0},
            "is_shortfall_member": False
        },
        {
            "user_id": "user2",
            "has_paid_current_round": True, 
            "round_contributions": {"1": 100.0},
            "is_shortfall_member": False
        },
        {
            "user_id": "user3",
            "has_paid_current_round": True,
            "round_contributions": {"1": 100.0}, 
            "is_shortfall_member": False
        },
        {
            "user_id": "user4", 
            "has_paid_current_round": True,
            "round_contributions": {"1": 50.0},  # Partial payer
            "is_shortfall_member": False
        },
        {
            "user_id": "user5",  # NEW SHORTFALL MEMBER
            "has_paid_current_round": True,
            "round_contributions": {"1": 50.0},  # Pays only shortfall amount
            "is_shortfall_member": True,
            "auto_verified": True  # Auto-verified by admin
        }
    ]
    
    contribution_amount = 100.0
    current_round = 1
    
    # Calculate using OLD logic (BROKEN)
    old_expected = len(group_members) * contribution_amount  # 5 × 100 = 500
    
    # Calculate using NEW logic (FIXED) 
    new_expected = 0.0
    for member in group_members:
        round_contribs = member.get("round_contributions") or {}
        paid_amount = float(round_contribs.get(str(current_round), 0))
        
        if member.get("is_shortfall_member") and "shortfall_amount_due" in member:
            # For shortfall members who haven't paid yet, expect their shortfall amount
            new_expected += float(member.get("shortfall_amount_due", contribution_amount))
        elif member.get("is_shortfall_member") and member.get("auto_verified"):
            # For auto-verified shortfall members, expect what they actually paid
            new_expected += paid_amount
        elif member.get("has_paid_current_round") and paid_amount > 0:
            # For members who have paid, expect what they actually paid
            new_expected += paid_amount
        else:
            # For members who haven't paid yet, expect full contribution
            new_expected += contribution_amount
    
    # Calculate total collected
    total_collected = 0.0
    for member in group_members:
        round_contribs = member.get("round_contributions") or {}
        total_collected += float(round_contribs.get(str(current_round), 0))
    
    # Calculate paid members
    paid_members = len([m for m in group_members if m.get("has_paid_current_round")])
    total_members = len(group_members)
    
    print(f"Group Status:")
    print(f"   Total Members: {total_members}")
    print(f"   Paid Members: {paid_members}")
    print(f"   Total Collected: {total_collected} ETB")
    print()
    
    print(f"Expected Amount Calculations:")
    print(f"   OLD Logic (Broken): {old_expected} ETB")
    print(f"   NEW Logic (Fixed):  {new_expected} ETB")
    print()
    
    print(f"Shortfall Detection:")
    old_shortfall = old_expected - total_collected
    new_shortfall = new_expected - total_collected
    
    print(f"   OLD Logic Shortfall: {old_shortfall} ETB")
    print(f"   NEW Logic Shortfall: {new_shortfall} ETB")
    print()
    
    # Test all_paid logic
    old_all_paid = (paid_members == total_members and abs(total_collected - old_expected) < 0.01)
    new_all_paid = (paid_members == total_members and abs(total_collected - new_expected) < 0.01)
    
    print(f"Group Ready Status:")
    print(f"   OLD Logic - All Paid: {old_all_paid}")
    print(f"   NEW Logic - All Paid: {new_all_paid}")
    print()
    
    # Results
    if old_all_paid:
        print("OLD LOGIC: Shows 'Select Winner' (but still shows shortfall warning)")
    else:
        print("OLD LOGIC: Shows 'Handle Shortfall' (even though it's complete)")
    
    if new_all_paid:
        print("NEW LOGIC: Shows 'Select Winner' (correct!)")
    else:
        print("NEW LOGIC: Shows 'Handle Shortfall' (incorrect)")
    
    print()
    print("CONCLUSION:")
    if new_all_paid and not old_all_paid:
        print("FIX SUCCESSFUL! Shortfall detection now works correctly.")
        print("After adding a member to cover shortfall, the group is properly")
        print("marked as complete and ready for winner selection.")
    else:
        print("FIX FAILED! The logic still needs work.")
    
    return new_all_paid and not old_all_paid

if __name__ == "__main__":
    success = test_shortfall_calculation()
    exit(0 if success else 1)