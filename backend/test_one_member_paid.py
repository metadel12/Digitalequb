"""
Test scenario: Round 2 with ONLY 1 member paid (100 ETB), others not paid
This matches what user described: "one members pad but collecting amount is 0"
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear and create group with ONLY 1 member paid in round 2
db['groups'].delete_many({})

markos_group = {
    "_id": "markos",
    "name": "markos",
    "members": [
        {"user_id": "u1", "full_name": "Member 1", "email": "m1@test.com", 
         "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},  # PAID
        {"user_id": "u2", "full_name": "Member 2", "email": "m2@test.com",
         "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},  # NOT PAID
        {"user_id": "u3", "full_name": "Member 3", "email": "m3@test.com",
         "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},  # NOT PAID
        {"user_id": "u4", "full_name": "Member 4", "email": "m4@test.com",
         "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},  # NOT PAID
        {"user_id": "u5", "full_name": "Member 5", "email": "m5@test.com",
         "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},  # NOT PAID
    ],
    "contribution_amount": 100,
    "total_rounds": 10,
    "current_round": 2,
    "status": "active",
}

db['groups'].insert_one(markos_group)
print("✓ Created group: 1 member paid 100 in R2, 4 members not paid")

# Test AdminService
print("\n=== ADMIN SERVICE RESPONSE ===")
from app.services.admin_service import AdminService
admin_service = AdminService(db)
result = admin_service.get_all_groups()

for group in result:
    if group['group_name'] == 'markos':
        print(f"Group: {group['group_name']}")
        print(f"Expected Amount: {group['expected_amount']} ETB")
        print(f"Total Collected: {group['total_collected']} ETB")
        print(f"Shortfall: {max(0, group['expected_amount'] - group['total_collected'])} ETB")
        print(f"All Paid: {group['all_paid']}")
        print(f"Paid Members: {group['paid_members']}/5")
        
        if group['total_collected'] == 100 and group['expected_amount'] == 400:
            print(f"\n✓ CORRECT: Collected=100, Expected=400, Shortfall=300")
        else:
            print(f"\n✗ ERROR: Expected Collected=100, got {group['total_collected']}")
