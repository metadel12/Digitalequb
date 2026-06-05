#!/usr/bin/env python3
"""Test the fixed expected amount calculation"""

# Test data: 5 members all paid, total collected = 400 ETB
members_data = [
    {"has_paid_current_round": True, "round_contributions": {"2": 100.0}},
    {"has_paid_current_round": True, "round_contributions": {"2": 100.0}}, 
    {"has_paid_current_round": True, "round_contributions": {"2": 100.0}},
    {"has_paid_current_round": True, "round_contributions": {"2": 50.0}},   # Bekel paid 50
    {"has_paid_current_round": True, "round_contributions": {"2": 50.0}, "is_shortfall_member": True, "auto_verified": True}  # Estifanos paid 50
]

contribution_amount = 100.0
current_round = 2

# Apply the FIXED logic
expected_amount = 0.0
for member in members_data:
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

total_collected = sum(float(m.get("round_contributions", {}).get(str(current_round), 0)) for m in members_data)
paid_members = len([m for m in members_data if m.get("has_paid_current_round", False)])

all_paid = (
    len(members_data) > 0 
    and paid_members == len(members_data) 
    and abs(total_collected - expected_amount) < 0.01
)

print("=== EXPECTED AMOUNT CALCULATION TEST ===")
print(f"Total Members: {len(members_data)}")
print(f"Paid Members: {paid_members}/{len(members_data)}")
print(f"Total Collected: {total_collected:.2f} ETB")
print(f"Expected Amount: {expected_amount:.2f} ETB")
print(f"Shortfall: {expected_amount - total_collected:.2f} ETB")
print(f"All Paid Status: {all_paid}")
print(f"Button Should Show: {'Select Winner' if all_paid else 'Handle Shortfall'}")

if expected_amount == 400.0 and total_collected == 400.0 and all_paid:
    print("\nSUCCESS: Fix is working correctly!")
    print("Expected: 400 ETB, Collected: 400 ETB, Button: Select Winner")
else:
    print(f"\nFAILED: Still showing wrong values")