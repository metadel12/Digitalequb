from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

# Check markos group details
markos = db['groups'].find_one({'name': 'markos'})
print('=== MARKOS GROUP ===')
print(f'Current Round: {markos.get("current_round")}')
print(f'Total Members: {len(markos.get("members", []))}')

for i, member in enumerate(markos.get('members', []), 1):
    print(f'\nMember {i}: {member.get("name")}')
    print(f'  Round Contributions: {member.get("round_contributions", {})}')
    print(f'  Shortfall Due: {member.get("shortfall_amount_due")}')
