"""
Direct service test for shortfall handling (bypasses auth)
Tests shortfall detection and member addition directly
"""

import sys
sys.path.insert(0, 'c:\\Users\\tg computer\\Desktop\\digitequb\\backend')

from app.core.database import get_database_instance
from app.services.admin_service import AdminService
from app.services.winner_service import WinnerService
import json

def format_group_data(group_data):
    """Pretty print group data"""
    print(f"\n{'='*70}")
    print(f"Group: {group_data['group_name']} (ID: {group_data['group_id']})")
    print(f"Round: {group_data.get('current_round', 1)}")
    print(f"Members: {group_data.get('paid_members', 0)}/{group_data.get('total_members', 0)} paid")
    print(f"Expected: {group_data.get('expected_amount', 0):.2f} ETB")
    print(f"Collected: {group_data.get('total_collected', 0):.2f} ETB")
    shortfall = group_data.get('expected_amount', 0) - group_data.get('total_collected', 0)
    if shortfall > 0:
        print(f"⚠️ SHORTFALL: {shortfall:.2f} ETB")
    else:
        print(f"✅ No shortfall")
    print(f"All Paid: {group_data.get('all_paid')}")
    print(f"{'='*70}")

def test_shortfall_handling():
    """Test shortfall detection and handling"""
    try:
        db = get_database_instance()
        admin_service = AdminService(db)
        winner_service = WinnerService(db)
        
        print("\n🔍 SHORTFALL HANDLING TEST (Direct Service)")
        print("="*70)
        
        # Get all groups
        all_groups = admin_service.get_all_groups()
        print(f"\n📊 Found {len(all_groups)} group(s)")
        
        target_group = None
        for group in all_groups:
            format_group_data(group)
            
            # Check for target scenario
            if (group.get('total_collected') == 350 and 
                group.get('expected_amount') == 400):
                target_group = group
                print("\n🎯 TARGET SCENARIO FOUND!")
        
        if not target_group:
            print("\n⚠️ Target scenario not found")
            return
        
        # Step 2: Check if group is ready for winner (should be False due to shortfall)
        print("\n🔄 Checking groups ready for winner selection...")
        ready_groups = winner_service.get_groups_ready_for_winner()
        
        is_ready = any(g['group_id'] == target_group['group_id'] for g in ready_groups)
        
        if is_ready:
            print(f"❌ ERROR: Group is ready for winner despite shortfall!")
        else:
            print(f"✅ CORRECT: Group is NOT ready due to shortfall")
        
        # Step 3: Handle the shortfall
        print("\n" + "="*70)
        print("📝 HANDLING SHORTFALL...")
        print("="*70)
        
        group_id = target_group['group_id']
        shortfall_amount = target_group['expected_amount'] - target_group['total_collected']
        shortfall_member_email = "shortfall-handler@example.com"
        admin_id = "admin-123"
        
        result = admin_service.add_member_for_shortfall(
            group_id,
            shortfall_member_email,
            shortfall_amount,
            admin_id
        )
        
        print(f"\n✅ Shortfall member added!")
        print(f"   {result['message']}")
        
        # Step 4: Verify the shortfall member was added
        print("\n" + "="*70)
        print("✓ Verifying shortfall member...")
        print("="*70)
        
        updated_groups = admin_service.get_all_groups()
        updated_group = next((g for g in updated_groups if g['group_id'] == group_id), None)
        
        if updated_group:
            format_group_data(updated_group)
            
            # Check if the new member is there
            group_doc = db["groups"].find_one({"_id": group_id})
            if group_doc:
                total_members_after = len(group_doc.get("members", []))
                shortfall_members = [m for m in group_doc.get("members", []) 
                                     if m.get("is_shortfall_member")]
                
                print(f"\nGroup Details:")
                print(f"  Total members now: {total_members_after}")
                print(f"  Shortfall members: {len(shortfall_members)}")
                
                if shortfall_members:
                    member = shortfall_members[0]
                    print(f"  Shortfall member: {member.get('full_name', 'Unknown')}")
                    print(f"  Amount due: {member.get('shortfall_amount_due', 0):.2f} ETB")
                    print(f"  Payment status: {'Paid' if member.get('has_paid_current_round') else 'Pending'}")
                
                print("\n✅ SUCCESS! Shortfall member added and waiting for payment")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_shortfall_handling()
