"""
Test WinnerService.get_groups_ready_for_winner() with all members paid in round 2
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear and create test group - ALL MEMBERS PAID
db['groups'].delete_many({})

markos_group = {
    "_id": "markos",
    "name": "markos",
    "members": [
        {"user_id": "u1", "full_name": "Member 1", "email": "m1@test.com", 
         "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
        {"user_id": "u2", "full_name": "Member 2", "email": "m2@test.com",
         "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
        {"user_id": "u3", "full_name": "Member 3", "email": "m3@test.com",
         "round_contributions": {"1": 100, "2": 100}, "has_paid_current_round": True},
        {"user_id": "u4", "full_name": "Member 4", "email": "m4@test.com",
         "round_contributions": {"1": 50, "2": 50}, "has_paid_current_round": True},
        {"user_id": "u5", "full_name": "Member 5", "email": "m5@test.com",
         "round_contributions": {"1": 50, "2": 50}, "has_paid_current_round": True},
    ],
    "contribution_amount": 100,
    "total_rounds": 10,
    "current_round": 2,
    "status": "active",
}

db['groups'].insert_one(markos_group)
print("✓ Created test group - ALL members paid in round 2 (400 ETB)")

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
    print(f"  Members: {len(group['members'])}")
    
    # Verify correctness
    if (group['expected_amount'] == 400 and 
        group['total_collected'] == 400 and 
        group['prize_pool'] == 400):
        print(f"\n✓ CORRECT: Expected=400, Collected=400, Prize=400")
    else:
        print(f"\n✗ ERROR: Expected=400, Collected=400, Prize=400")
        print(f"  Got: Expected={group['expected_amount']}, Collected={group['total_collected']}, Prize={group['prize_pool']}")
else:
    print("✗ No groups returned")
