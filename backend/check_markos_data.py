#!/usr/bin/env python3
"""Check Markos group member payment data."""
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

from app.core.database import get_database_instance
from pprint import pprint

db = get_database_instance()
group = db['groups'].find_one({'name': {'$regex': 'markos', '$options': 'i'}})

if not group:
    print("❌ No Markos group found")
    sys.exit(1)

print(f"\n📋 GROUP: {group.get('name')}")
print(f"   Contribution: {group.get('contribution_amount')} ETB")
print(f"   Current Round: {group.get('current_round')}")
print(f"   Total Members: {len(group.get('members', []))}")

current_round = str(group.get('current_round'))
total_collected = 0

print(f"\n👥 MEMBERS:")
for i, member in enumerate(group.get('members', []), 1):
    round_contrib = member.get('round_contributions', {}).get(current_round, 0)
    has_paid = member.get('has_paid_current_round', False)
    is_shortfall = member.get('is_shortfall_member', False)
    shortfall_due = member.get('shortfall_amount_due')
    
    total_collected += round_contrib
    
    status = "✅ PAID" if has_paid else "⏳ PENDING"
    shortfall_str = f" (Shortfall: {shortfall_due})" if is_shortfall and shortfall_due else ""
    
    print(f"  {i}. {member.get('full_name', 'Unknown')}")
    print(f"     Status: {status}, Paid: {round_contrib} ETB{shortfall_str}")

print(f"\n💰 SUMMARY:")
print(f"   Total Collected: {total_collected} ETB")

# Calculate expected_amount using the NEW logic
contribution_amount = group.get('contribution_amount', 0)
expected_amount = 0.0
for member in group.get('members', []):
    round_contribs = member.get('round_contributions') or {}
    paid_amount = float(round_contribs.get(current_round, 0))
    shortfall_due = member.get('shortfall_amount_due')
    
    if paid_amount > 0:
        expected_amount += paid_amount
    elif shortfall_due is not None:
        expected_amount += float(shortfall_due)
    else:
        expected_amount += contribution_amount

shortfall = expected_amount - total_collected
print(f"   Expected Amount: {expected_amount} ETB")
print(f"   Shortfall: {shortfall} ETB")
print(f"   All Paid: {abs(shortfall) < 0.01}")

print(f"\n📌 BUTTON SHOULD SHOW:")
if abs(shortfall) < 0.01:
    print("   ✅ 'Select Winner' (all paid, ready!)")
else:
    print(f"   ⚠️ 'Handle Shortfall' ({shortfall:.0f} ETB needed)")
