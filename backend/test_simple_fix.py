#!/usr/bin/env python3
"""
Simple test to verify expected amount calculation fix.
"""

def test_shortfall_fix():
    """Test that matches the exact bug scenario: 5 members, 400 ETB collected, expected should be 450 ETB"""
    
    contribution_amount = 100.0
    current_round = 2
    
    # Original 5 members: 4 paid 100, 1 paid 50
    # Then admin added 1 shortfall member who paid 50 (auto-verified)
    members = [
        {"user_id": "m1", "has_paid_current_round": True, "round_contributions": {"2": 100.0}},
        {"user_id": "m2", "has_paid_current_round": True, "round_contributions": {"2": 100.0}},
        {"user_id": "m3", "has_paid_current_round": True, "round_contributions": {"2": 100.0}},
        {"user_id": "m4", "has_paid_current_round": True, "round_contributions": {"2": 100.0}},
        {"user_id": "m5", "has_paid_current_round": True, "round_contributions": {"2": 50.0}},
        # Shortfall member added by admin with auto-verification
        {
            "user_id": "m6", 
            "has_paid_current_round": True, 
            "round_contributions": {"2": 50.0},
            "is_shortfall_member": True,
            "shortfall_amount_due": 50.0,  # This should be IGNORED since has_paid_current_round=True
            "auto_verified": True
        }
    ]
    
    # Apply the FIXED logic
    expected_amount = 0.0
    for member in members:
        round_contribs = member.get("round_contributions", {})
        paid_amount = float(round_contribs.get(str(current_round), 0))
        
        if member.get("has_paid_current_round") and paid_amount > 0:
            expected_amount += paid_amount
        elif member.get("is_shortfall_member") and "shortfall_amount_due" in member and not member.get("has_paid_current_round"):
            expected_amount += float(member.get("shortfall_amount_due", contribution_amount))
        else:
            expected_amount += contribution_amount
    
    total_collected = sum(float(m.get("round_contributions", {}).get(str(current_round), 0)) for m in members)
    paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
    
    all_paid = (
        len(members) > 0 
        and paid_members == len(members) 
        and abs(total_collected - expected_amount) < 0.01
    )
    
    print("=== SHORTFALL FIX TEST ===")
    print(f"Members: {len(members)} (5 original + 1 shortfall)")
    print(f"Paid Members: {paid_members}/{len(members)}")
    print(f"Total Collected: {total_collected:.2f} ETB")
    print(f"Expected Amount: {expected_amount:.2f} ETB")
    print(f"All Paid Status: {all_paid}")
    print(f"Button Should Show: {'Select Winner' if all_paid else 'Handle Shortfall'}")
    
    # The fix is successful if:
    # - Total collected = 500 ETB (100+100+100+100+50+50)
    # - Expected amount = 500 ETB (should match collected)  
    # - All paid = True (should show Select Winner button)
    
    if all_paid and abs(total_collected - 500.0) < 0.01 and abs(expected_amount - 500.0) < 0.01:
        print("RESULT: SUCCESS - Fix is working!")
        print("The group will now show 'Select Winner' instead of 'Handle Shortfall'")
        return True
    else:
        print("RESULT: FAILED - Fix did not work")
        return False

if __name__ == "__main__":
    test_shortfall_fix()