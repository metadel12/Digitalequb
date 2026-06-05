#!/usr/bin/env python3
"""
Diagnostic script to check ethi-eqube group status through admin service.
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
from app.services.admin_service import AdminService

def check_group_status():
    """Check group status through admin service."""
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        admin_service = AdminService(db)
        
        # Get all groups
        all_groups = admin_service.get_all_groups()
        
        # Find ethi-eqube
        ethi_eqube = None
        for group in all_groups:
            if group["group_name"] == "ethi-eqube":
                ethi_eqube = group
                break
        
        if not ethi_eqube:
            print("❌ ethi-eqube group not found")
            return
        
        print("=" * 70)
        print("ethi-eqube Group Status (via admin_service.get_all_groups)")
        print("=" * 70)
        print()
        print(f"Group Name: {ethi_eqube['group_name']}")
        print(f"Current Round: {ethi_eqube['current_round']}/{ethi_eqube['total_rounds']}")
        print(f"Contribution Amount: {ethi_eqube['contribution_amount']} ETB")
        print()
        print("Payment Summary:")
        print(f"  Total Members: {ethi_eqube['total_members']}")
        print(f"  Paid Members: {ethi_eqube['paid_members']}")
        print(f"  Pending Members: {ethi_eqube['pending_members']}")
        print()
        print("Financial Summary:")
        print(f"  Expected Amount: {ethi_eqube['expected_amount']} ETB")
        print(f"  Total Collected: {ethi_eqube['total_collected']} ETB")
        shortfall = ethi_eqube['expected_amount'] - ethi_eqube['total_collected']
        print(f"  Shortfall/Surplus: {shortfall:+.2f} ETB")
        print()
        print("Prize Distribution (at 90/10 split):")
        print(f"  Winner Gets: {ethi_eqube['winner_amount']} ETB (90%)")
        print(f"  Platform Fee: {ethi_eqube['platform_fee']} ETB (10%)")
        print()
        print(f"All Paid: {ethi_eqube['all_paid']}")
        print(f"Ready for Winner Selection: {ethi_eqube['all_paid']}")
        print()
        
        # Get member details
        print("=" * 70)
        print("Detailed Member Status")
        print("=" * 70)
        member_status = admin_service.get_group_members_status(ethi_eqube['group_id'])
        
        for i, member in enumerate(member_status['members'], 1):
            status_icon = "✅" if member['has_paid_current_round'] else "⏳"
            shortfall_note = ""
            if member.get('is_shortfall_member'):
                shortfall_note = f" [SHORTFALL MEMBER - Due: {member['shortfall_amount_due']} ETB]"
            print(f"{i}. {status_icon} {member['full_name']}")
            print(f"   Email: {member['email']}")
            print(f"   Paid: {member['paid_amount']} ETB | Expected: {member['expected_amount']} ETB{shortfall_note}")
        
        print()
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    check_group_status()
