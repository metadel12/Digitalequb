"""
Check what data is actually in the database and what AdminService returns
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Check what groups exist
groups = list(db['groups'].find({}, {'name': 1, 'members': {'$slice': 1}, 'current_round': 1, 'contribution_amount': 1}))
print("=== GROUPS IN DATABASE ===")
for group in groups:
    print(f"\nGroup: {group.get('name')}")
    print(f"  ID: {group['_id']}")
    print(f"  Current Round: {group.get('current_round')}")
    print(f"  Contribution: {group.get('contribution_amount')}")
    print(f"  Members: {len(group.get('members', []))}")
    if group.get('members'):
        m = group['members'][0]
        print(f"  First Member: {m.get('full_name')}")
        print(f"    Round Contributions: {m.get('round_contributions')}")

# Test AdminService on real data
print("\n=== ADMIN SERVICE TEST ===")
from app.services.admin_service import AdminService
admin_service = AdminService(db)
result = admin_service.get_all_groups()

print(f"\nAdminService returned {len(result)} groups:")
for group in result:
    print(f"\nGroup: {group['group_name']}")
    print(f"  Current Round: {group['current_round']}")
    print(f"  Expected Amount: {group['expected_amount']} ETB")
    print(f"  Total Collected: {group['total_collected']} ETB")
    print(f"  Paid Members: {group['paid_members']}")
    print(f"  All Paid: {group['all_paid']}")
