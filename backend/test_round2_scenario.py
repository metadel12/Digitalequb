"""
Test scenario: Round 1 complete (400 ETB), Round 2 in progress (350 ETB collected)
Expected: Should stay 400 ETB fixed (not increase)
Shortfall in R2: 50 ETB
"""

from pymongo import MongoClient
import json

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear existing data
db['groups'].delete_many({})

# Create test group: Markos (5 members, established 400 ETB in round 1)
markos_group = {
    "_id": "markos",
    "name": "markos",
    "description": "Test group for round 2 scenario",
    "members": [
        {"name": "Member1", "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},
        {"name": "Member2", "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},
        {"name": "Member3", "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},
        {"name": "Member4", "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},
        {"name": "Member5", "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},
    ],
    "contribution_amount": 100,
    "total_rounds": 12,
    "current_round": 2,  # Now in Round 2
    "balance": 400,
    "status": "active",
}

db['groups'].insert_one(markos_group)
print("✓ Created Markos group with:")
print("  - Round 1: All paid (400 ETB collected)")
print("  - Round 2: Just started, no payments yet")
print("\nNow testing API response...")

# Test the admin service
from app.services.admin_service import AdminService
admin_service = AdminService(db)
groups = admin_service.get_all_groups()

for group in groups:
    if group['group_name'] == 'markos':
        print(f"\n📊 Markos Group Response:")
        print(f"  Current Round: {group['current_round']}")
        print(f"  Total Members: {group['total_members']}")
        print(f"  Paid Members (R2): {group['paid_members']}")
        print(f"  Total Collected (R2): {group['total_collected']} ETB")
        print(f"  Expected Amount: {group['expected_amount']} ETB")
        print(f"  Shortfall: {max(0, group['expected_amount'] - group['total_collected'])} ETB")
        print(f"  All Paid: {group['all_paid']}")
        print(f"\n{'✓ CORRECT' if group['expected_amount'] == 400 else '✗ ERROR'}: Expected should be 400 ETB (fixed from R1)")
