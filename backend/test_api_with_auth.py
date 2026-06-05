"""
Test the API with authentication
"""

import requests
import json

# First, login with admin credentials
print("=== LOGGING IN ===")
login_response = requests.post('http://localhost:8001/api/v1/auth/login', json={
    "email": "admin@digitequb.com",
    "password": "Admin@123"
}, timeout=5)

print(f"Login Status: {login_response.status_code}")

if login_response.status_code == 200:
    data = login_response.json()
    token = data.get('access_token')
    print(f"✓ Got token: {token[:20]}...")
    
    # Now get groups with auth
    print("\n=== GETTING ADMIN GROUPS ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get('http://localhost:8001/api/v1/admin/groups', headers=headers, timeout=5)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ API returned {len(data)} groups")
        
        for group in data:
            if group['group_name'] == 'markos':
                print(f"\n=== GROUP: {group['group_name']} ===")
                print(f"Expected Amount: {group.get('expected_amount')} ETB")
                print(f"Total Collected: {group.get('total_collected')} ETB")
                print(f"Winner Amount: {group.get('winner_amount')} ETB")
                print(f"Platform Fee: {group.get('platform_fee')} ETB")
                print(f"All Paid: {group.get('all_paid')}")
                
                # Check what frontend would show
                collected = group.get('total_collected', 0)
                expected = group.get('expected_amount', 0)
                shortfall = expected - collected if expected and collected else 0
                print(f"\nFrontend would display:")
                print(f"  Expected: {expected}")
                print(f"  Collected: {collected}")
                print(f"  Shortfall: {max(0, shortfall)}")
    else:
        print(f"✗ Error: {response.text}")
else:
    print(f"✗ Login failed: {login_response.text}")
