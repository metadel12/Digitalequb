import pytest
from app.services.transaction_service import TransactionService

def test_transaction_service_init():
    # Mock db
    db = None
    service = TransactionService(db)
    assert service.db == db