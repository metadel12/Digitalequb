"""
Check if members have has_paid_current_round flag and full data
"""

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

group = db['groups'].find_one({'name': 'markos'})
print("=== MARKOS GROUP FULL DATA ===")
print(f"Group ID: {group['_id']}")
print(f"Current Round: {group.get('current_round')}")
print(f"Members Count: {len(group.get('members', []))}")

print("\n=== ALL MEMBERS ===")
for i, member in enumerate(group.get('members', []), 1):
    print(f"\nMember {i}: {member.get('full_name')}")
    print(f"  Has Paid Current Round: {member.get('has_paid_current_round')}")
    print(f"  Round Contributions: {member.get('round_contributions')}")
    print(f"  User ID: {member.get('user_id')}")

# Check WinnerService
print("\n=== WINNER SERVICE TEST ===")
from app.services.winner_service import WinnerService
winner_service = WinnerService(db)
ready_groups = winner_service.get_groups_ready_for_winner()

print(f"\nReady for Winner Groups: {len(ready_groups)}")
if ready_groups:
    g = ready_groups[0]
    print(f"Group: {g['group_name']}")
    print(f"Expected: {g.get('expected_amount')} ETB")
    print(f"Collected: {g.get('total_collected')} ETB")
    print(f"Members: {g['members_count']}")
else:
    print("No groups ready for winner (filtered out)")
