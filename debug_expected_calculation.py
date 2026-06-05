#!/usr/bin/env python3
"""
Debug script to check raw member data and expected amount calculation.
"""

import sys
import os
from pathlib import Path

# Set up Python path - add backend directory
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Load environment variables
from dotenv import load_dotenv
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(str(env_file))

from pymongo import MongoClient
from app.core.config import settings

def debug():
    """Debug member data and expected calculation."""
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        # Find ethi-eqube group
        group = db["groups"].find_one({"name": "ethi-eqube"})
        if not group:
            print("❌ Group not found")
            return
        
        print("=" * 80)
        print("RAW MEMBER DATA")
        print("=" * 80)
        print()
        
        members = group.get("members", [])
        contribution_amount = float(group.get("contribution_amount", 0))
        current_round = int(group.get("current_round", 1))
        
        print(f"Contribution Amount: {contribution_amount} ETB")
        print(f"Current Round: {current_round}")
        print(f"Total Members: {len(members)}")
        print()
        
        expected_total = 0.0
        
        for i, member in enumerate(members, 1):
            is_shortfall = member.get("is_shortfall_member", False)
            round_contribs = member.get("round_contributions", {})
            paid_amount = float(round_contribs.get(str(current_round), 0))
            shortfall_due = float(member.get("shortfall_amount_due", 0)) if is_shortfall else 0
            
            # Calculate expected amount for this member (logic from admin_service)
            if is_shortfall:
                expected_for_member = shortfall_due
                calc_reason = f"SHORTFALL: {shortfall_due} ETB"
            elif paid_amount > 0:
                expected_for_member = paid_amount
                calc_reason = f"PAID: {paid_amount} ETB"
            else:
                expected_for_member = contribution_amount
                calc_reason = f"NOT PAID: {contribution_amount} ETB"
            
            expected_total += expected_for_member
            
            print(f"{i}. {member.get('full_name', 'Unknown')}")
            print(f"   Email: {member.get('email')}")
            print(f"   Is Shortfall Member: {is_shortfall}")
            print(f"   Shortfall Amount Due: {shortfall_due}")
            print(f"   Paid in Round {current_round}: {paid_amount} ETB")
            print(f"   Expected for this member: {expected_for_member} ETB ({calc_reason})")
            print()
        
        print("=" * 80)
        print(f"TOTAL EXPECTED: {expected_total} ETB")
        print(f"TOTAL COLLECTED: {sum(float(m.get('round_contributions', {}).get(str(current_round), 0)) for m in members)} ETB")
        print(f"SHORTFALL: {expected_total - sum(float(m.get('round_contributions', {}).get(str(current_round), 0)) for m in members)} ETB")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    debug()
