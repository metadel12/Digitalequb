import pytest
from app.services.user_service import UserService

def test_user_service_init():
    # Mock db
    db = None
    service = UserService(db)
    assert service.db == db