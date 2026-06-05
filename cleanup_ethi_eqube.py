#!/usr/bin/env python3
"""
Clean up duplicate shortfall members and verify expected amount calculation.
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

def cleanup():
    """Remove duplicate shortfall members."""
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        # Find ethi-eqube group
        group = db["groups"].find_one({"name": "ethi-eqube"})
        if not group:
            print("❌ Group not found")
            return
        
        print("=" * 70)
        print("Cleaning up duplicate shortfall members")
        print("=" * 70)
        print()
        
        # Get all members
        members = group.get("members", [])
        print(f"Current members: {len(members)}")
        print()
        
        # Find shortfall members
        shortfall_members = [m for m in members if m.get("is_shortfall_member")]
        print(f"Shortfall members: {len(shortfall_members)}")
        for i, m in enumerate(shortfall_members, 1):
            print(f"  {i}. {m.get('email')} - Due: {m.get('shortfall_amount_due')} ETB")
        print()
        
        # If there's more than one shortfall member, keep only the one with 50 ETB due
        if len(shortfall_members) > 1:
            print("Removing duplicate shortfall members...")
            
            # Remove all shortfall members first
            new_members = [m for m in members if not m.get("is_shortfall_member")]
            
            # Add back only the one with 50 ETB (smallest amount)
            shortfall_to_keep = min(shortfall_members, key=lambda m: float(m.get("shortfall_amount_due", 0)))
            new_members.append(shortfall_to_keep)
            
            # Update group
            db["groups"].update_one(
                {"_id": group["_id"]},
                {
                    "$set": {
                        "members": new_members,
                        "updated_at": group.get("updated_at")
                    }
                }
            )
            
            print(f"✅ Removed {len(shortfall_members) - 1} duplicate shortfall members")
            print(f"✅ Kept shortfall member with 50 ETB due")
        else:
            print("✅ No duplicates to remove")
        
        print()
        print("=" * 70)
        print("Verifying final status...")
        print("=" * 70)
        
        # Re-fetch and verify
        updated_group = db["groups"].find_one({"name": "ethi-eqube"})
        updated_members = updated_group.get("members", [])
        
        print()
        print(f"Final member count: {len(updated_members)}")
        for i, m in enumerate(updated_members, 1):
            if m.get("is_shortfall_member"):
                print(f"  {i}. {m.get('full_name')} - {m.get('email')} [SHORTFALL {m.get('shortfall_amount_due')} ETB]")
            else:
                contrib = m.get("round_contributions", {}).get("1", 0)
                print(f"  {i}. {m.get('full_name')} - {m.get('email')} [{contrib} ETB paid]")
        
        print()
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    cleanup()
