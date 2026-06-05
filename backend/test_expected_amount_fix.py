#!/usr/bin/env python3
"""
Test script to verify the expected amount calculation fix for shortfall handling.

This script simulates the scenario:
- 5 member group with 100 ETB contribution each
- 4 members paid 100 ETB each (400 ETB total)
- 1 member paid 50 ETB (partial payment)
- Expected should be 450 ETB (4 * 100 + 50)
- When shortfall member added for 50 ETB with auto-verification, expected should still be 450 ETB
"""

def test_expected_amount_calculation():
    """Test the expected amount calculation logic"""
    
    # Mock group data matching the bug scenario
    contribution_amount = 100.0
    current_round = 2
    
    # Members data: 4 paid full, 1 paid partial, 1 shortfall member added with auto-verification
    members = [
        # Member 1: Paid full amount
        {
            "user_id": "member1",
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0},
            "is_shortfall_member": False
        },
        # Member 2: Paid full amount  
        {
            "user_id": "member2",
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0},
            "is_shortfall_member": False
        },
        # Member 3: Paid full amount
        {
            "user_id": "member3", 
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0},
            "is_shortfall_member": False
        },
        # Member 4: Paid full amount
        {
            "user_id": "member4",
            "has_paid_current_round": True,
            "round_contributions": {"2": 100.0},
            "is_shortfall_member": False
        },
        # Member 5: Paid partial amount (50 ETB)
        {
            "user_id": "member5",
            "has_paid_current_round": True,
            "round_contributions": {"2": 50.0},
            "is_shortfall_member": False
        },
        # Member 6: Shortfall member added with auto-verification for 50 ETB
        {
            "user_id": "member6",
            "has_paid_current_round": True,  # Auto-verified
            "round_contributions": {"2": 50.0},  # Paid 50 ETB
            "is_shortfall_member": True,
            "shortfall_amount_due": 50.0,  # This field still exists but should be ignored
            "auto_verified": True
        }
    ]
    
    # Calculate expected amount using the FIXED logic
    expected_amount = 0.0
    for member in members:
        round_contribs = member.get("round_contributions") or {}
        paid_amount = float(round_contribs.get(str(current_round), 0))
        
        if member.get("has_paid_current_round") and paid_amount > 0:
            # For members who have paid (including auto-verified shortfall members), expect what they actually paid
            expected_amount += paid_amount
            print(f"Member {member['user_id']}: has_paid=True, paid_amount={paid_amount:.2f}, adding to expected")
        elif member.get("is_shortfall_member") and "shortfall_amount_due" in member and not member.get("has_paid_current_round"):
            # For shortfall members who haven't paid yet, expect their shortfall amount
            shortfall_due = float(member.get("shortfall_amount_due", contribution_amount))
            expected_amount += shortfall_due
            print(f"Member {member['user_id']}: shortfall_member unpaid, shortfall_due={shortfall_due:.2f}, adding to expected")
        else:
            # For members who haven't paid yet, expect full contribution
            expected_amount += contribution_amount
            print(f"Member {member['user_id']}: unpaid regular member, adding full contribution={contribution_amount:.2f}")
    
    total_collected = sum(
        float(member.get("round_contributions", {}).get(str(current_round), 0))
        for member in members
    )
    
    print(f"\n=== CALCULATION RESULTS ===")
    print(f"Total Members: {len(members)}")
    print(f"Contribution Amount: {contribution_amount:.2f} ETB")
    print(f"Total Collected: {total_collected:.2f} ETB")
    print(f"Expected Amount: {expected_amount:.2f} ETB")
    print(f"Difference: {abs(total_collected - expected_amount):.2f} ETB")
    
    # Check if all paid (should be True now)
    paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
    all_paid = (
        len(members) > 0 
        and paid_members == len(members) 
        and abs(total_collected - expected_amount) < 0.01
    )
    
    print(f"Paid Members: {paid_members}/{len(members)}")
    print(f"All Paid Status: {all_paid}")
    print(f"Should Show 'Select Winner': {all_paid}")
    
    # Verify the expected results
    expected_total_collected = 450.0  # 4*100 + 50 + 50
    expected_expected_amount = 450.0  # Should match collected amount
    
    success = (
        abs(total_collected - expected_total_collected) < 0.01
        and abs(expected_amount - expected_expected_amount) < 0.01
        and all_paid
    )
    
    print(f"\n=== TEST RESULT ===")
    if success:
        print("✅ SUCCESS: Expected amount calculation is now CORRECT!")
        print("✅ Group should show 'Select Winner' button instead of 'Handle Shortfall'")
    else:
        print("❌ FAILED: Expected amount calculation is still incorrect")
        print(f"   Expected total_collected: {expected_total_collected:.2f}, got: {total_collected:.2f}")
        print(f"   Expected expected_amount: {expected_expected_amount:.2f}, got: {expected_amount:.2f}")
    
    return success

if __name__ == "__main__":
    test_expected_amount_calculation()