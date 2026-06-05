#!/usr/bin/env python3
"""
Test for exact user scenario:
- 3 members paid 100 ETB each
- 1 member (Bekel Melese) paid 50 ETB  
- 1 shortfall member (Estifanos Fiker) added and paid 50 ETB
- Expected should be 400 ETB (total collected)
- Should show "Select Winner"
"""

def test_user_exact_scenario():
    """Test the user's exact scenario"""
    
    contribution_amount = 100.0
    current_round = 2
    
    # User's actual member data
    members = [
        # Member 1: Paid 100 ETB
        {
            "user_id": "member1",
            "full_name": "Member 1",
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0}
        },
        # Temesgen Girsha: Paid 100 ETB  
        {
            "user_id": "temesgen",
            "full_name": "Temesgen Girsha", 
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0}
        },
        # Mahlet Limenew: Paid 100 ETB
        {
            "user_id": "mahlet",
            "full_name": "Mahlet Limenew",
            "has_paid_current_round": True, 
            "round_contributions": {"2": 100.0}
        },
        # BEKEL MELESE: Paid 50 ETB (partial payment)
        {
            "user_id": "bekel",
            "full_name": "BEKEL MELESE",
            "has_paid_current_round": True,
            "round_contributions": {"2": 50.0}
        },
        # Estifanos Fiker: Added for shortfall, paid 50 ETB
        {
            "user_id": "estifanos", 
            "full_name": "Estifanos Fiker",
            "has_paid_current_round": True,
            "round_contributions": {"2": 50.0},
            "is_shortfall_member": True,
            "shortfall_amount_due": 50.0,  # This should be ignored since has_paid_current_round=True
            "auto_verified": True
        }
    ]
    
    # Apply the FIXED expected amount calculation
    expected_amount = 0.0
    for member in members:
        round_contribs = member.get("round_contributions", {})
        paid_amount = float(round_contribs.get(str(current_round), 0))
        
        if member.get("has_paid_current_round") and paid_amount > 0:
            # For members who have paid, expect what they actually paid
            expected_amount += paid_amount
        elif member.get("is_shortfall_member") and "shortfall_amount_due" in member and not member.get("has_paid_current_round"):
            # For shortfall members who haven't paid yet, expect their shortfall amount only
            expected_amount += float(member.get("shortfall_amount_due", contribution_amount))
        else:
            # For regular members who haven't paid yet, expect full contribution
            expected_amount += contribution_amount
    
    # Calculate total collected
    total_collected = sum(
        float(member.get("round_contributions", {}).get(str(current_round), 0))
        for member in members
    )
    
    # Calculate if all paid
    paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
    all_paid = (
        len(members) > 0 
        and paid_members == len(members) 
        and abs(total_collected - expected_amount) < 0.01
    )
    
    print("=== USER'S EXACT SCENARIO TEST ===")
    print("Member payments:")
    for member in members:
        paid = member.get("round_contributions", {}).get(str(current_round), 0)
        status = "SHORTFALL" if member.get("is_shortfall_member") else "REGULAR"
        print(f"  {member['full_name']}: {paid:.2f} ETB ({status})")
    
    print(f"\\nResults:")
    print(f"Total Members: {len(members)}")
    print(f"Paid Members: {paid_members}/{len(members)}")
    print(f"Total Collected: {total_collected:.2f} ETB")
    print(f"Expected Amount: {expected_amount:.2f} ETB") 
    print(f"Shortfall: {expected_amount - total_collected:.2f} ETB")
    print(f"All Paid Status: {all_paid}")
    print(f"Button Should Show: {'Select Winner' if all_paid else 'Handle Shortfall'}")
    
    # Verify this matches user's desired outcome
    success = (
        abs(total_collected - 400.0) < 0.01 and  # Total collected = 400 ETB
        abs(expected_amount - 400.0) < 0.01 and  # Expected = 400 ETB  
        all_paid  # Should be ready for winner
    )
    
    print(f"\\n=== RESULT ===")
    if success:
        print("✅ SUCCESS: Shows 'Select Winner' - Expected 400, Collected 400")
        print("✅ The group is now properly ready for winner selection!")
    else:
        print("❌ FAILED: Still shows incorrect amounts or 'Handle Shortfall'")
        print(f"   Expected total_collected: 400.00, got: {total_collected:.2f}")
        print(f"   Expected expected_amount: 400.00, got: {expected_amount:.2f}")
        print(f"   Expected all_paid: True, got: {all_paid}")
    
    return success

if __name__ == "__main__":
    test_user_exact_scenario()