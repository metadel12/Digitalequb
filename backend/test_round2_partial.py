"""
Test scenario 2: Round 1 complete (400 ETB), Round 2 with partial payments (350 ETB paid, 50 ETB shortfall)
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Update markos group to have some round 2 payments
db['groups'].update_one(
    {'_id': 'markos'},
    {'$set': {
        'members': [
            {"name": "Member1", "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
            {"name": "Member2", "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
            {"name": "Member3", "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
            {"name": "Member4", "round_contributions": {"1": 50, "2": 50}, "has_paid_current_round": True},
            {"name": "Member5", "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},
        ]
    }}
)

print("✓ Updated Markos group with:")
print("  - Round 2: 4 members paid 350 ETB (100+100+100+50)")
print("  - Round 2: 1 member hasn't paid (50 ETB shortfall)")

# Test the admin service
from app.services.admin_service import AdminService
admin_service = AdminService(db)
groups = admin_service.get_all_groups()

for group in groups:
    if group['group_name'] == 'markos':
        print(f"\n📊 Markos Group Response (R2 with partial payments):")
        print(f"  Current Round: {group['current_round']}")
        print(f"  Total Members: {group['total_members']}")
        print(f"  Paid Members (R2): {group['paid_members']}")
        print(f"  Total Collected (R2): {group['total_collected']} ETB")
        print(f"  Expected Amount: {group['expected_amount']} ETB")
        print(f"  Shortfall: {max(0, group['expected_amount'] - group['total_collected'])} ETB")
        print(f"  All Paid: {group['all_paid']}")
        
        expected_shortfall = 50
        is_correct = (
            group['expected_amount'] == 400
            and abs(max(0, group['expected_amount'] - group['total_collected']) - expected_shortfall) < 0.01
        )
        print(f"\n{'✓ CORRECT' if is_correct else '✗ ERROR'}: Expected 400 ETB, Shortfall 50 ETB")
