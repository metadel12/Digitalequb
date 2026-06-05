"""
Test WinnerService.get_groups_ready_for_winner() with expected_amount and total_collected
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear and create test group
db['groups'].delete_many({})

markos_group = {
    "_id": "markos",
    "name": "markos",
    "members": [
        {"name": "Member1", "user_id": "u1", "full_name": "Member 1", "email": "m1@test.com", 
         "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
        {"name": "Member2", "user_id": "u2", "full_name": "Member 2", "email": "m2@test.com",
         "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},
        {"name": "Member3", "user_id": "u3", "full_name": "Member 3", "email": "m3@test.com",
         "round_contributions": {"1": 100, "2": 0}, "has_paid_current_round": False},
        {"name": "Member4", "user_id": "u4", "full_name": "Member 4", "email": "m4@test.com",
         "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},
        {"name": "Member5", "user_id": "u5", "full_name": "Member 5", "email": "m5@test.com",
         "round_contributions": {"1": 50, "2": 0}, "has_paid_current_round": False},
    ],
    "contribution_amount": 100,
    "total_rounds": 10,
    "current_round": 2,
    "status": "active",
}

db['groups'].insert_one(markos_group)

print("✓ Created test group with one member paid in round 2")

from app.services.winner_service import WinnerService
winner_service = WinnerService(db)

groups = winner_service.get_groups_ready_for_winner()

if groups:
    group = groups[0]
    print(f"\n📊 WinnerService Response:")
    print(f"  Group: {group['group_name']}")
    print(f"  Current Round: {group['current_round']}")
    print(f"  Expected Amount: {group['expected_amount']} ETB")
    print(f"  Total Collected: {group['total_collected']} ETB")
    print(f"  Prize Pool: {group['prize_pool']} ETB")
    print(f"  Members Paid: {sum(1 for m in group['members'] if m['has_paid_current_round'])}/{len(group['members'])}")
    
    # Verify correctness
    if (group['expected_amount'] == 400 and 
        group['total_collected'] == 100 and 
        group['prize_pool'] == 100):
        print(f"\n✓ CORRECT: Expected=400, Collected=100, Prize=100")
    else:
        print(f"\n✗ ERROR: Values not as expected")
else:
    print("No groups returned (might be filtered by 'all_paid' check)")
