from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["digiequb"]

# Find the tessss group specifically
group = db["groups"].find_one({"name": "tessss"})
if group:
    print(f"Group: {group['name']}")
    print(f"Current Round: {group.get('current_round', 1)}")
    print(f"Contribution: {group.get('contribution_amount')} ETB")
    
    members = group.get("members", [])
    print(f"Total Members: {len(members)}")
    
    current_round = group.get("current_round", 1)
    total_collected = 0
    paid_count = 0
    
    for i, member in enumerate(members):
        round_contribs = member.get("round_contributions", {})
        paid_amount = round_contribs.get(str(current_round), 0)
        has_paid = member.get("has_paid_current_round", False)
        is_shortfall = member.get("is_shortfall_member", False)
        
        if has_paid:
            paid_count += 1
            total_collected += paid_amount
        
        print(f"{i+1}. {member.get('full_name')}")
        print(f"   Has Paid: {has_paid}")
        print(f"   Amount: {paid_amount} ETB")
        print(f"   Is Shortfall Member: {is_shortfall}")
        print(f"   Shortfall Due: {member.get('shortfall_amount_due', 'N/A')}")
    
    print(f"\nSummary:")
    print(f"Paid Members: {paid_count}/{len(members)}")
    print(f"Total Collected: {total_collected} ETB")
    print(f"Expected Simple: {len(members) * group.get('contribution_amount', 0)} ETB")