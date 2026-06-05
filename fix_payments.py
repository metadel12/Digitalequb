from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["digiequb"]

# Fix the tessss group payments
group_id = db["groups"].find_one({"name": "tessss"})["_id"]
current_round = 2

# Update payment amounts based on what you described
updates = [
    {"name": "HAILE MICHAEL", "amount": 100.0},
    {"name": "Temesgen Girsha", "amount": 100.0}, 
    {"name": "Mahlet Limenew", "amount": 100.0},
    {"name": "BEKEL MELESE", "amount": 50.0},
    {"name": "Estifanos Fiker", "amount": 50.0}
]

for update in updates:
    result = db["groups"].update_one(
        {
            "_id": group_id,
            "members.full_name": update["name"]
        },
        {
            "$set": {
                f"members.$.round_contributions.{current_round}": update["amount"]
            }
        }
    )
    print(f"Updated {update['name']}: {result.modified_count} record(s)")

print("Payment amounts fixed!")

# Verify the fix
group = db["groups"].find_one({"_id": group_id})
total_collected = 0
for member in group.get("members", []):
    round_contribs = member.get("round_contributions", {})
    paid_amount = round_contribs.get(str(current_round), 0)
    total_collected += paid_amount
    print(f"{member.get('full_name')}: {paid_amount} ETB")

print(f"Total Collected: {total_collected} ETB")