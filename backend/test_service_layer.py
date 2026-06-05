"""
Test AdminService response matches what API should return
"""

from pymongo import MongoClient
from app.services.admin_service import AdminService
import json

client = MongoClient('mongodb://localhost:27017')
db = client['equb_db']

print("=== TESTING ADMIN SERVICE ===\n")

# Get current database state
markos = db['groups'].find_one({'name': 'markos'})
print(f"Database Group State:")
print(f"  Current Round: {markos['current_round']}")
print(f"  Members: {len(markos['members'])}")

# Count paid members in round 2
r2_paid = sum(1 for m in markos['members'] if float(m.get('round_contributions', {}).get('2', 0)) > 0)
r2_total = sum(float(m.get('round_contributions', {}).get('2', 0)) for m in markos['members'])
print(f"  R2 Paid Members: {r2_paid}/{len(markos['members'])}")
print(f"  R2 Total Collected: {r2_total} ETB")

# Test service
print("\n=== ADMIN SERVICE RESPONSE ===")
admin_service = AdminService(db)
groups = admin_service.get_all_groups()

for group in groups:
    if group['group_name'] == 'markos':
        print(f"Group: {group['group_name']}")
        print(f"Current Round: {group['current_round']}")
        print(f"Expected Amount: {group['expected_amount']} ETB")
        print(f"Total Collected: {group['total_collected']} ETB")
        print(f"Winner Amount: {group['winner_amount']} ETB")
        print(f"Platform Fee: {group['platform_fee']} ETB")
        print(f"All Paid: {group['all_paid']}")
        print(f"Paid Members: {group['paid_members']}/{group['total_members']}")
        
        # Verify calculations
        print("\n=== VERIFICATION ===")
        if group['total_collected'] == r2_total:
            print(f"✓ Collected matches DB: {group['total_collected']}")
        else:
            print(f"✗ Collected mismatch: Got {group['total_collected']}, Expected {r2_total}")
            
        if group['expected_amount'] == 400:
            print(f"✓ Expected is correct baseline: 400 ETB")
        else:
            print(f"✗ Expected mismatch: Got {group['expected_amount']}, Expected 400")
            
        shortfall = max(0, group['expected_amount'] - group['total_collected'])
        expected_shortfall = 400 - r2_total
        if abs(shortfall - expected_shortfall) < 0.01:
            print(f"✓ Shortfall is correct: {shortfall}")
        else:
            print(f"✗ Shortfall mismatch: Got {shortfall}, Expected {expected_shortfall}")
        
        # What frontend should display
        print(f"\n=== FRONTEND DISPLAY ===")
        print(f"Expected: {group['expected_amount']}")
        print(f"Collected: {group['total_collected']}")
        print(f"Shortfall: {shortfall}")
