"""
Create and handle shortfall scenario with existing 'ethio' group
Modifies the group to have 350 collected (shortfall of 50 from 400 expected)
"""

import sys
sys.path.insert(0, 'c:\\Users\\tg computer\\Desktop\\digitequb\\backend')

from app.core.database import get_database_instance
from app.services.admin_service import AdminService
from app.services.winner_service import WinnerService
from bson import ObjectId

def format_group_data(group_data):
    """Pretty print group data"""
    print(f"\n{'='*70}")
    print(f"Group: {group_data['group_name']} (ID: {group_data['group_id']})")
    print(f"Round: {group_data.get('current_round', 1)}")
    print(f"Members: {group_data.get('paid_members', 0)}/{group_data.get('total_members', 0)} paid")
    print(f"Expected: {group_data.get('expected_amount', 0):.2f} ETB")
    print(f"Collected: {group_data.get('total_collected', 0):.2f} ETB")
    shortfall = max(0, group_data.get('expected_amount', 0) - group_data.get('total_collected', 0))
    if shortfall > 0:
        print(f"⚠️ SHORTFALL: {shortfall:.2f} ETB")
    else:
        print(f"✅ No shortfall - ready for winner!")
    print(f"All Paid: {group_data.get('all_paid')}")
    print(f"{'='*70}")

def setup_and_handle_shortfall():
    """Setup shortfall scenario and handle it"""
    try:
        db = get_database_instance()
        admin_service = AdminService(db)
        winner_service = WinnerService(db)
        
        print("\n🔧 SETTING UP SHORTFALL SCENARIO")
        print("="*70)
        print("Target: 350 ETB collected vs 400 ETB expected = 50 ETB shortfall")
        
        # Find the ethio group
        group = db["groups"].find_one({"name": "ethio"})
        if not group:
            print("❌ 'ethio' group not found")
            return
        
        group_id = group["_id"]
        print(f"\n✅ Found group: {group['name']} (ID: {group_id})")
        
        # Modify members to have 350 total instead of 400
        # 4 members: make them pay 87.5 each = 350 total
        members = list(group.get("members", []))
        
        print(f"\n📝 Modifying member payments:")
        for i, member in enumerate(members):
            member["round_contributions"] = {"1": 87.5}
            member["total_contributed"] = 87.5
            member["has_paid_current_round"] = True
            print(f"   Member {i+1}: 87.5 ETB")
        
        # Update group
        db["groups"].update_one(
            {"_id": group_id},
            {"$set": {"members": members}}
        )
        
        print(f"   Total: 350 ETB")
        
        # Get updated group data
        print("\n" + "="*70)
        print("📊 BEFORE HANDLING SHORTFALL")
        print("="*70)
        
        all_groups = admin_service.get_all_groups()
        current_group = next((g for g in all_groups if g['group_id'] == str(group_id)), None)
        
        if not current_group:
            print("❌ Group not found in admin service")
            return
        
        format_group_data(current_group)
        
        # Check if ready for winner (should be False)
        ready_groups = winner_service.get_groups_ready_for_winner()
        is_ready = any(g['group_id'] == str(group_id) for g in ready_groups)
        
        print(f"\nReady for winner selection: {'❌ YES (ERROR!)' if is_ready else '✅ NO (Correct - shortfall)'}")
        
        # Handle the shortfall
        print("\n" + "="*70)
        print("🔄 HANDLING SHORTFALL")
        print("="*70)
        
        shortfall_amount = 50.0
        shortfall_member_email = "shortfall-handler-50etb@example.com"
        admin_id = "admin-test"
        
        print(f"\n📝 Adding shortfall member:")
        print(f"   Email: {shortfall_member_email}")
        print(f"   Amount due: {shortfall_amount:.2f} ETB")
        
        result = admin_service.add_member_for_shortfall(
            str(group_id),
            shortfall_member_email,
            shortfall_amount,
            admin_id
        )
        
        print(f"\n✅ {result['message']}")
        
        # Get updated status
        print("\n" + "="*70)
        print("📊 AFTER HANDLING SHORTFALL")
        print("="*70)
        
        all_groups = admin_service.get_all_groups()
        updated_group = next((g for g in all_groups if g['group_id'] == str(group_id)), None)
        
        if updated_group:
            format_group_data(updated_group)
            
            # Check members
            group_doc = db["groups"].find_one({"_id": group_id})
            total_members = len(group_doc.get("members", []))
            shortfall_members = [m for m in group_doc.get("members", []) if m.get("is_shortfall_member")]
            regular_members = [m for m in group_doc.get("members", []) if not m.get("is_shortfall_member")]
            
            print(f"\n👥 Member Summary:")
            print(f"   Total members: {total_members}")
            print(f"   Regular members (paid): {len(regular_members)}")
            print(f"   Shortfall members (pending): {len(shortfall_members)}")
            
            if shortfall_members:
                member = shortfall_members[0]
                print(f"\n💰 Shortfall Member:")
                print(f"   Name: {member.get('full_name', 'Unknown')}")
                print(f"   Email: {member.get('email', 'N/A')}")
                print(f"   Amount due: {member.get('shortfall_amount_due', 0):.2f} ETB")
                print(f"   Payment status: {'✅ Paid' if member.get('has_paid_current_round') else '⏳ Pending'}")
                print(f"   Flag: is_shortfall_member = {member.get('is_shortfall_member')}")
            
            print("\n" + "="*70)
            print("✅ SHORTFALL HANDLED SUCCESSFULLY!")
            print("="*70)
            print("\n📝 Next Steps:")
            print("   1. Shortfall member receives notification")
            print("   2. Shortfall member submits payment proof")
            print("   3. Admin verifies and approves payment")
            print("   4. Once paid, winner selection becomes available")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_and_handle_shortfall()
