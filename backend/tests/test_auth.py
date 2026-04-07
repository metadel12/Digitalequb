import pytest
from app.services.auth_service import AuthService

def test_auth_service_init():
    # Mock db
    db = None
    service = AuthService(db)
    assert service.db == db