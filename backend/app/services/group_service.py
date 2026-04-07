from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from ..models.user import Group, GroupMember, User
from ..schemas.group import GroupCreate, GroupDetailResponse, GroupMemberResponse, GroupResponse, GroupUpdate


class GroupService:
    def __init__(self, db: Session):
        self.db = db

    def create_group(self, group_data: GroupCreate, creator_id: UUID) -> Group:
        group = Group(
            name=group_data.name,
            description=group_data.description,
            contribution_amount=group_data.contribution_amount,
            frequency=group_data.frequency,
            duration_weeks=group_data.duration_weeks,
            max_members=group_data.max_members,
            current_members=0,
            status="pending",
            created_by=creator_id,
            start_date=None,
            end_date=None,
            rules=group_data.rules or {},
            is_private=group_data.is_private,
        )
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group

    def update_group_contract(self, group_id: UUID, contract_address: str) -> Group:
        group = self.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")
        group.contract_address = contract_address
        self.db.commit()
        self.db.refresh(group)
        return group

    def add_member(self, group_id: UUID, user_id: UUID, position: int = 0) -> GroupMember:
        membership = GroupMember(
            user_id=user_id,
            group_id=group_id,
            position=position,
            contribution_count=0,
            total_contributed=0.0,
        )
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def get_groups(self, skip: int = 0, limit: int = 20, status: Optional[str] = None, user_id: Optional[UUID] = None) -> List[Group]:
        query = self.db.query(Group)
        if status:
            query = query.filter(Group.status == status)
        if user_id:
            query = query.outerjoin(GroupMember, GroupMember.group_id == Group.id).filter(
                (Group.created_by == user_id) | (GroupMember.user_id == user_id)
            )
        return query.order_by(Group.created_at.desc()).offset(skip).limit(limit).all()

    def get_user_groups(self, user_id: UUID) -> List[Group]:
        return (
            self.db.query(Group)
            .outerjoin(GroupMember, GroupMember.group_id == Group.id)
            .filter((GroupMember.user_id == user_id) | (Group.created_by == user_id))
            .options(joinedload(Group.members))
            .distinct()
            .order_by(Group.created_at.desc())
            .all()
        )

    def get_group_by_id(self, group_id: UUID) -> Optional[Group]:
        return (
            self.db.query(Group)
            .options(joinedload(Group.members), joinedload(Group.creator))
            .filter(Group.id == group_id)
            .first()
        )

    def is_group_member(self, group_id: UUID, user_id: UUID) -> bool:
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
            is not None
        )

    def get_group_detail(self, group_id: UUID) -> GroupDetailResponse:
        group = self.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")

        members = self.get_group_members(group_id)
        total_contributions = sum(member.total_contributed for member in group.members)
        next_payout_date = group.start_date
        if group.start_date:
            if group.frequency == "daily":
                next_payout_date = group.start_date + timedelta(days=group.current_members or 0)
            elif group.frequency == "weekly":
                next_payout_date = group.start_date + timedelta(weeks=group.current_members or 0)
            else:
                next_payout_date = group.start_date + timedelta(days=30 * (group.current_members or 0))

        return GroupDetailResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            contribution_amount=group.contribution_amount,
            frequency=group.frequency,
            duration_weeks=group.duration_weeks,
            max_members=group.max_members,
            is_private=group.is_private,
            rules=group.rules or {},
            status=group.status,
            current_members=group.current_members,
            contract_address=group.contract_address,
            created_by=group.created_by,
            start_date=group.start_date,
            end_date=group.end_date,
            join_code=group.join_code,
            created_at=group.created_at,
            creator={
                "id": str(group.creator.id) if group.creator else None,
                "full_name": group.creator.full_name if group.creator else "Unknown",
                "email": group.creator.email if group.creator else "",
            },
            members=[member.dict() for member in members],
            total_contributions=float(total_contributions),
            next_payout_amount=float(group.contribution_amount * max(group.current_members, 1)),
            next_payout_date=next_payout_date,
        )

    def update_group(self, group_id: UUID, group_data: GroupUpdate) -> Group:
        group = self.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")
        updates = group_data.dict(exclude_unset=True)
        for field, value in updates.items():
            setattr(group, field, value)
        self.db.commit()
        self.db.refresh(group)
        return group

    def remove_member(self, group_id: UUID, user_id: UUID) -> bool:
        membership = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )
        if not membership:
            return False
        self.db.delete(membership)
        self.db.commit()
        return True

    def update_member_count(self, group_id: UUID, count: int) -> Group:
        group = self.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")
        group.current_members = max(count, 0)
        self.db.commit()
        self.db.refresh(group)
        return group

    def delete_group(self, group_id: UUID) -> bool:
        group = self.get_group_by_id(group_id)
        if not group:
            return False
        self.db.delete(group)
        self.db.commit()
        return True

    def get_group_members(self, group_id: UUID) -> List[GroupMemberResponse]:
        memberships = (
            self.db.query(GroupMember)
            .options(joinedload(GroupMember.user))
            .filter(GroupMember.group_id == group_id)
            .order_by(GroupMember.position.asc())
            .all()
        )
        return [
            GroupMemberResponse(
                user_id=item.user_id,
                full_name=item.user.full_name if item.user else "Unknown",
                email=item.user.email if item.user else "",
                joined_at=item.joined_at,
                position=item.position,
                contribution_count=item.contribution_count,
                total_contributed=float(item.total_contributed or 0),
                next_payment_due=item.next_payment_due,
            )
            for item in memberships
        ]

    def start_group(self, group_id: UUID) -> Group:
        group = self.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")
        group.status = "active"
        if not group.start_date:
            group.start_date = datetime.utcnow()
        if not group.end_date:
            group.end_date = group.start_date + timedelta(weeks=group.duration_weeks)
        self.db.commit()
        self.db.refresh(group)
        return group

    def update_member_contribution(self, group_id: UUID, user_id: UUID, amount: float) -> GroupMember:
        membership = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )
        if not membership:
            raise ValueError("Membership not found")
        membership.contribution_count += 1
        membership.total_contributed = float(membership.total_contributed or 0) + float(amount)
        membership.next_payment_due = datetime.utcnow() + timedelta(weeks=1)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def is_payout_due(self, group_id: UUID) -> bool:
        group = self.get_group_by_id(group_id)
        if not group:
            return False
        return group.current_members > 0 and group.status == "active"

    def calculate_payout_amount(self, group_id: UUID) -> float:
        group = self.get_group_by_id(group_id)
        if not group:
            return 0.0
        return float(group.contribution_amount * max(group.current_members, 1))

    def get_next_winner(self, group_id: UUID) -> GroupMember:
        membership = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.received_payout.is_(False))
            .order_by(GroupMember.position.asc(), GroupMember.joined_at.asc())
            .first()
        )
        if not membership:
            membership = (
                self.db.query(GroupMember)
                .filter(GroupMember.group_id == group_id)
                .order_by(GroupMember.position.asc(), GroupMember.joined_at.asc())
                .first()
            )
        if not membership:
            raise ValueError("No eligible members found")
        return membership
