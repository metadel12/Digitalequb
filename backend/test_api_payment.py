"""
Test actual API response when one member has paid 100 ETB
"""

from pymongo import MongoClient

# Connect to DB
client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear existing data
db['groups'].delete_many({})

# Create test group with one member having paid in round 2
markos_group = {
    "_id": "markos",
    "name": "markos",
    "members": [
        {"name": "Member1", "round_contributions": {"1": 100, "2": 100}},  # ONE member paid
        {"name": "Member2", "round_contributions": {"1": 100, "2": 0}},
        {"name": "Member3", "round_contributions": {"1": 100, "2": 0}},
        {"name": "Member4", "round_contributions": {"1": 50, "2": 0}},
        {"name": "Member5", "round_contributions": {"1": 50, "2": 0}},
    ],
    "contribution_amount": 100,
    "total_rounds": 10,
    "current_round": 2,
    "status": "active",
}

db['groups'].insert_one(markos_group)

print("✓ Created Markos group with one member paid 100 ETB in round 2")
print("\nTesting AdminService directly...")

# Use AdminService
from app.services.admin_service import AdminService
admin_service = AdminService(db)

groups = admin_service.get_all_groups()
for group in groups:
    if group['group_name'] == 'markos':
        print(f"\n📊 AdminService Response for Markos:")
        print(f"  Current Round: {group['current_round']}")
        print(f"  Members Paid: {group['paid_members']}/5")
        print(f"  Collected: {group['total_collected']} ETB")
        print(f"  Expected: {group['expected_amount']} ETB")
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        print(f"  Shortfall: {shortfall} ETB")
        
        if group['total_collected'] == 100 and group['expected_amount'] == 400:
            print(f"\n✓ CORRECT: Shows 100 ETB collected, 400 ETB expected, 300 ETB shortfall")
        else:
            print(f"\n✗ ERROR: Should show 100 ETB collected, got {group['total_collected']}")
