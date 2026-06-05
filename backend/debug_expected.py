from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

group = db['groups'].find_one({'_id': 'markos'})
members = group['members']

# Debug: Check what latest_payment_round is detected
latest_payment_round = 0
for member in members:
    round_contribs = member.get("round_contributions") or {}
    print(f"Member {member['name']}: {round_contribs}")
    for round_str in round_contribs.keys():
        try:
            round_num = int(round_str)
            latest_payment_round = max(latest_payment_round, round_num)
        except (ValueError, TypeError):
            pass

print(f"\nLatest Payment Round: {latest_payment_round}")

# Debug: Check what expected_amount calculation gives
contribution_amount = 100
round_for_calc = latest_payment_round if latest_payment_round > 0 else 2

expected = 0
for member in members:
    round_contribs = member.get("round_contributions") or {}
    paid_amount = float(round_contribs.get(str(round_for_calc), 0))
    print(f"\nMember {member['name']}: paid in round {round_for_calc} = {paid_amount}")
    if paid_amount > 0:
        expected += paid_amount
    else:
        expected += contribution_amount
        print(f"  (no payment, adding full contribution {contribution_amount})")

print(f"\nExpected Amount: {expected}")
