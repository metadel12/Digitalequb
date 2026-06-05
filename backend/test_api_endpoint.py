"""
Test the actual HTTP API endpoint to see what data it returns
"""

import requests
import json

# Make sure backend is running
try:
    # Get all groups
    response = requests.get('http://localhost:8001/api/v1/admin/groups', timeout=5)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ API returned {len(data)} groups")
        
        for group in data:
            if group['group_name'] == 'markos':
                print(f"\n=== GROUP: {group['group_name']} ===")
                print(f"Expected Amount: {group.get('expected_amount')} ETB")
                print(f"Total Collected: {group.get('total_collected')} ETB")
                print(f"Winner Amount: {group.get('winner_amount')} ETB")
                print(f"Platform Fee: {group.get('platform_fee')} ETB")
                print(f"All Paid: {group.get('all_paid')}")
                print(f"Total Members: {group.get('total_members')}")
                print(f"Paid Members: {group.get('paid_members')}")
                
                # Check what frontend would show
                collected = group.get('total_collected', 0)
                expected = group.get('expected_amount', 0)
                shortfall = expected - collected if expected and collected else 0
                print(f"\nFrontend display:")
                print(f"  Expected: {expected}")
                print(f"  Collected: {collected}")
                print(f"  Shortfall: {max(0, shortfall)}")
    else:
        print(f"✗ API error: {response.text}")
        
except Exception as e:
    print(f"✗ Error: {e}")
    print("Make sure backend is running on port 8001")
