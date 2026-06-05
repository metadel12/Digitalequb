#!/usr/bin/env python3
"""
Admin utility functions to handle groups that should be considered complete
despite having unpaid shortfall members.
"""

# Add these methods to AdminService class

def mark_shortfall_member_as_complete_with_zero_payment(
    self,
    group_id: str,
    admin_id: str,
    reason: str = "Admin decision: Group complete without shortfall payment"
) -> Dict[str, Any]:
    """
    Mark any unpaid shortfall members as having paid 0 ETB, making the group ready for winner selection.
    This is useful when admin decides the group should proceed without the shortfall payment.
    """
    group = self.db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise ValueError("Group not found")
    
    if group.get("status") != "active":
        raise ValueError("Group is not active")
    
    members = list(group.get("members") or [])
    current_round = int(group.get("current_round") or current_round_number(group))
    
    # Find unpaid shortfall members
    unpaid_shortfall_members = []
    for member in members:
        if (member.get("is_shortfall_member") and 
            not member.get("has_paid_current_round") and
            "shortfall_amount_due" in member):
            unpaid_shortfall_members.append(member)
    
    if not unpaid_shortfall_members:
        return {
            "success": True,
            "message": "No unpaid shortfall members found. Group is already ready.",
            "members_updated": 0
        }
    
    now = utcnow()
    updated_count = 0
    
    for member in unpaid_shortfall_members:
        user_id = str(member.get("user_id"))
        
        # Update member as paid with 0 contribution
        self.db["groups"].update_one(
            {"_id": str(group_id), "members.user_id": user_id},
            {
                "$set": {
                    "members.$.has_paid_current_round": True,
                    "members.$.payment_verified_at": now,
                    f"members.$.round_contributions.{current_round}": 0.0,  # 0 ETB payment
                    "members.$.admin_marked_complete": True,  # Flag for admin action
                    "members.$.admin_completion_reason": reason,
                    "updated_at": now,
                }
            }
        )
        
        # Create a payment record for audit trail
        payment_id = f"admin-complete-{group_id}-{user_id}-{int(now.timestamp())}"
        self.db["payment_verifications"].insert_one({
            "_id": payment_id,
            "group_id": str(group_id),
            "member_id": user_id,
            "member_name": member.get("full_name", "Unknown"),
            "member_email": member.get("email", ""),
            "amount": 0.0,  # 0 ETB payment
            "round_number": current_round,
            "status": "verified",
            "verified": True,
            "admin_marked_complete": True,
            "verified_by_admin": admin_id,
            "verified_at": now,
            "submitted_at": now,
            "transaction_reference": f"ADMIN-COMPLETE-{current_round}-{user_id}",
            "payment_method": "admin_completion",
            "notes": f"Admin marked complete with 0 ETB: {reason}"
        })
        
        # Notify the member
        user = self.db["users"].find_one({"_id": user_id})
        if user:
            self._create_user_notification(
                user_id,
                "✅ Group Completion - No Payment Required",
                f"The admin has marked '{group.get('name')}' group as complete for Round {current_round}.\\n\\n"
                f"Your shortfall payment of ETB {member.get('shortfall_amount_due', 0):.2f} is no longer required.\\n\\n"
                f"Reason: {reason}\\n\\n"
                f"The group will now proceed to winner selection. Good luck! 🍀",
                "group_completed"
            )
        
        updated_count += 1
        
        # Log the action
        self._insert_user_action_log(
            user_id,
            user.get("full_name") if user else "Unknown",
            "shortfall_marked_complete",
            admin_id,
            f"Admin marked shortfall member as complete with 0 ETB payment: {reason}"
        )
    
    logger.info(
        "Admin marked %d shortfall members as complete in group %s",
        updated_count,
        group.get("name")
    )
    
    return {
        "success": True,
        "message": f"Successfully marked {updated_count} shortfall member(s) as complete. Group is now ready for winner selection!",
        "members_updated": updated_count,
        "group_name": group.get("name"),
        "round_number": current_round,
        "ready_for_winner": True,
    }


def remove_unpaid_shortfall_members(
    self,
    group_id: str,
    admin_id: str,
    reason: str = "Admin decision: Remove unpaid shortfall members"
) -> Dict[str, Any]:
    """
    Remove unpaid shortfall members from the group, making it ready for winner selection.
    This is useful when admin decides the group should proceed without those members.
    """
    group = self.db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise ValueError("Group not found")
    
    if group.get("status") != "active":
        raise ValueError("Group is not active")
    
    members = list(group.get("members") or [])
    current_round = int(group.get("current_round") or current_round_number(group))
    
    # Find unpaid shortfall members to remove
    unpaid_shortfall_members = []
    remaining_members = []
    
    for member in members:
        if (member.get("is_shortfall_member") and 
            not member.get("has_paid_current_round") and
            "shortfall_amount_due" in member):
            unpaid_shortfall_members.append(member)
        else:
            remaining_members.append(member)
    
    if not unpaid_shortfall_members:
        return {
            "success": True,
            "message": "No unpaid shortfall members found to remove. Group is already ready.",
            "members_removed": 0
        }
    
    now = utcnow()
    
    # Update group to remove unpaid shortfall members
    self.db["groups"].update_one(
        {"_id": str(group_id)},
        {
            "$set": {
                "members": remaining_members,
                "updated_at": now,
            }
        }
    )
    
    # Notify removed members and log actions
    for member in unpaid_shortfall_members:
        user_id = str(member.get("user_id"))
        user = self.db["users"].find_one({"_id": user_id})
        
        if user:
            self._create_user_notification(
                user_id,
                "ℹ️ Removed from Group - Payment Not Required",
                f"You have been removed from '{group.get('name')}' group by the admin.\\n\\n"
                f"Your shortfall payment of ETB {member.get('shortfall_amount_due', 0):.2f} is no longer required.\\n\\n"
                f"Reason: {reason}\\n\\n"
                f"You can join other active groups if available.",
                "group_removal"
            )
        
        # Log the action
        self._insert_user_action_log(
            user_id,
            user.get("full_name") if user else "Unknown",
            "shortfall_member_removed",
            admin_id,
            f"Removed from group {group.get('name')} as unpaid shortfall member: {reason}"
        )
    
    logger.info(
        "Admin removed %d unpaid shortfall members from group %s",
        len(unpaid_shortfall_members),
        group.get("name")
    )
    
    return {
        "success": True,
        "message": f"Successfully removed {len(unpaid_shortfall_members)} unpaid shortfall member(s). Group is now ready for winner selection!",
        "members_removed": len(unpaid_shortfall_members),
        "new_member_count": len(remaining_members),
        "group_name": group.get("name"),
        "round_number": current_round,
        "ready_for_winner": True,
        "removed_members": [
            {
                "user_id": member.get("user_id"),
                "full_name": member.get("full_name", "Unknown"),
                "email": member.get("email", ""),
                "shortfall_amount_due": member.get("shortfall_amount_due", 0)
            }
            for member in unpaid_shortfall_members
        ]
    }