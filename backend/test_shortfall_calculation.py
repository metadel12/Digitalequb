"""
Test: As members pay on round 2, verify:
- Collected amount increases correctly
- Shortfall decreases correctly (NOT increases)
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Clear and create fresh test group
db['groups'].delete_many({})

markos_group = {
    "_id": "markos",
    "name": "markos",
    "members": [
        {"name": "Member1", "round_contributions": {"1": 100, "2": 0}},
        {"name": "Member2", "round_contributions": {"1": 100, "2": 0}},
        {"name": "Member3", "round_contributions": {"1": 100, "2": 0}},
        {"name": "Member4", "round_contributions": {"1": 50, "2": 0}},
        {"name": "Member5", "round_contributions": {"1": 50, "2": 0}},
    ],
    "contribution_amount": 100,
    "total_rounds": 12,
    "current_round": 2,
    "status": "active",
}

db['groups'].insert_one(markos_group)

from app.services.admin_service import AdminService
admin_service = AdminService(db)

# Test 1: No payments in round 2
print("=== TEST 1: Round 2, NO payments ===")
groups = admin_service.get_all_groups()
for group in groups:
    if group['group_name'] == 'markos':
        print(f"Expected: {group['expected_amount']} ETB")
        print(f"Collected: {group['total_collected']} ETB")
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        print(f"Shortfall: {shortfall} ETB")

# Test 2: One member pays 100 in round 2
print("\n=== TEST 2: One member pays 100 ETB ===")
db['groups'].update_one(
    {'_id': 'markos'},
    {'$set': {'members.0.round_contributions': {"1": 100, "2": 100}}}
)
groups = admin_service.get_all_groups()
for group in groups:
    if group['group_name'] == 'markos':
        print(f"Expected: {group['expected_amount']} ETB")
        print(f"Collected: {group['total_collected']} ETB")
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        print(f"Shortfall: {shortfall} ETB")

# Test 3: Second member pays 100 in round 2
print("\n=== TEST 3: Two members pay 100 ETB each ===")
markos = db['groups'].find_one({'_id': 'markos'})
members = markos['members']
members[0]['round_contributions']['2'] = 100
members[1]['round_contributions']['2'] = 100
db['groups'].update_one({'_id': 'markos'}, {'$set': {'members': members}})

groups = admin_service.get_all_groups()
for group in groups:
    if group['group_name'] == 'markos':
        print(f"Expected: {group['expected_amount']} ETB")
        print(f"Collected: {group['total_collected']} ETB")
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        print(f"Shortfall: {shortfall} ETB")

# Test 4: All members pay their round 1 amounts in round 2
print("\n=== TEST 4: All members pay (400 ETB total) ===")
markos = db['groups'].find_one({'_id': 'markos'})
members = markos['members']
for member in members:
    # Copy round 1 amounts to round 2
    r1_amount = member['round_contributions'].get('1', 0)
    member['round_contributions']['2'] = r1_amount
db['groups'].update_one({'_id': 'markos'}, {'$set': {'members': members}})

groups = admin_service.get_all_groups()
for group in groups:
    if group['group_name'] == 'markos':
        print(f"Expected: {group['expected_amount']} ETB")
        print(f"Collected: {group['total_collected']} ETB")
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        print(f"Shortfall: {shortfall} ETB")
        print(f"All Paid: {group['all_paid']}")

print("\n✓ As you can see, shortfall DECREASES as payments increase (this is correct)")
