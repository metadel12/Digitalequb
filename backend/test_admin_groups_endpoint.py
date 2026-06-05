"""
Test the /admin/groups endpoint directly
"""

from pymongo import MongoClient
from app.services.admin_service import AdminService

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Verify database state first
group = db['groups'].find_one({'name': 'markos'})
print("=== DATABASE STATE ===")
print(f"Group: {group['name']}")
print(f"Current Round: {group['current_round']}")
print(f"Members count: {len(group['members'])}")

# Check member details
total_r2 = 0
for member in group['members']:
    r2_contribution = member.get('round_contributions', {}).get('2', 0)
    total_r2 += r2_contribution
    print(f"  {member.get('full_name')}: R2={r2_contribution}")
print(f"Total R2 collected in DB: {total_r2}")

# Test AdminService.get_all_groups()
print("\n=== ADMIN SERVICE RESPONSE ===")
admin_service = AdminService(db)
result = admin_service.get_all_groups()

for group in result:
    if group['group_name'] == 'markos':
        print(f"Group: {group['group_name']}")
        print(f"Expected Amount: {group['expected_amount']}")
        print(f"Total Collected: {group['total_collected']}")
        print(f"Winner Amount: {group['winner_amount']}")
        print(f"Platform Fee: {group['platform_fee']}")
        print(f"Admin Bank: {group['admin_bank']}")
        print(f"All Paid: {group['all_paid']}")
