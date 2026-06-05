#!/usr/bin/env python3
"""
Debug script to check what the backend admin service is returning
"""

import sys
import json
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def debug_backend_calculation():
    """Debug the backend calculation"""
    
    print("Debugging Backend Group Calculation")
    print("=" * 50)
    
    # Simulate the exact group structure that would be in the database
    # after adding a shortfall member
    mock_group = {
        "_id": "test_group_123",
        "name": "Test Group",
        "contribution_amount": 100.0,
        "current_round": 2,
        "status": "active",
        "members": [
            {
                "user_id": "user1",
                "has_paid_current_round": True,
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user2", 
                "has_paid_current_round": True,
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user3",
                "has_paid_current_round": True,
                "round_contributions": {"2": 100.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user4",  # Partial payer
                "has_paid_current_round": True,
                "round_contributions": {"2": 50.0},
                "is_shortfall_member": False
            },
            {
                "user_id": "user5",  # Shortfall member added by admin
                "has_paid_current_round": True,
                "round_contributions": {"2": 50.0},
                "is_shortfall_member": True,
                "auto_verified": True
            }
        ]
    }
    
    # Import the calculation functions
    try:
        from app.core.mongo_utils import current_round_number, current_round_total_collected
        
        # Simulate the backend calculation
        members = list(mock_group.get("members") or [])
        total_members = len(members)
        paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
        total_collected = current_round_total_collected(mock_group)
        contribution_amount = float(mock_group.get("contribution_amount", 0))
        
        # NEW Logic from our fix
        expected_amount = 0.0
        for member in members:
            round_contribs = member.get("round_contributions") or {}
            current_round = int(mock_group.get("current_round") or current_round_number(mock_group))
            paid_amount = float(round_contribs.get(str(current_round), 0))
            
            if member.get("is_shortfall_member") and "shortfall_amount_due" in member:
                # For shortfall members who haven't paid yet
                expected_amount += float(member.get("shortfall_amount_due", contribution_amount))
            elif member.get("is_shortfall_member") and member.get("auto_verified"):
                # For auto-verified shortfall members, expect what they actually paid
                expected_amount += paid_amount
            elif member.get("has_paid_current_round") and paid_amount > 0:
                # For members who have paid, expect what they actually paid
                expected_amount += paid_amount
            else:
                # For members who haven't paid yet, expect full contribution
                expected_amount += contribution_amount
        
        # Check if all paid
        all_paid = (
            total_members > 0 
            and paid_members == total_members 
            and abs(total_collected - expected_amount) < 0.01
        )
        
        print(f"Group Analysis:")
        print(f"  Total Members: {total_members}")
        print(f"  Paid Members: {paid_members}")
        print(f"  Contribution Amount: {contribution_amount} ETB")
        print(f"  Current Round: {mock_group.get('current_round')}")
        print()
        
        print(f"Member Breakdown:")
        for i, member in enumerate(members, 1):
            round_contribs = member.get("round_contributions") or {}
            current_round = int(mock_group.get("current_round", 2))
            paid_amount = float(round_contribs.get(str(current_round), 0))
            is_shortfall = member.get("is_shortfall_member", False)
            auto_verified = member.get("auto_verified", False)
            
            print(f"  Member {i}: Paid {paid_amount} ETB, Shortfall: {is_shortfall}, Auto: {auto_verified}")
        print()
        
        print(f"Calculation Results:")
        print(f"  Total Collected: {total_collected} ETB")
        print(f"  Expected Amount: {expected_amount} ETB")
        print(f"  Shortfall: {expected_amount - total_collected} ETB")
        print(f"  All Paid: {all_paid}")
        print()
        
        if all_paid:
            print("SUCCESS: Group should show 'Select Winner'")
        else:
            print("PROBLEM: Group still shows 'Handle Shortfall'")
            
    except Exception as e:
        print(f"Error importing backend modules: {e}")
        print("Make sure you're running this from the project root directory")
        return False
    
    return all_paid

if __name__ == "__main__":
    success = debug_backend_calculation()
    exit(0 if success else 1)