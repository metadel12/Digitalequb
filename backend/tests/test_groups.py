import pytest
from app.services.group_service import GroupService

def test_group_service_init():
    # Mock db
    db = None
    service = GroupService(db)
    assert service.db == db