from datetime import datetime
from app.models.transaction import TransactionInDB, Transaction, TransactionCreate, TransactionUpdate

class TransactionService:
    def __init__(self, db):
        self.db = db

    async def create_transaction(self, transaction: TransactionCreate) -> Transaction:
        trans_doc = TransactionInDB(**transaction.dict())
        result = await self.db.transactions.insert_one(trans_doc.dict(by_alias=True))
        trans_doc.id = result.inserted_id
        return Transaction(**trans_doc.dict())

    async def get_transaction_by_id(self, transaction_id: str) -> Transaction:
        trans = await self.db.transactions.find_one({"_id": transaction_id})
        if not trans:
            return None
        return Transaction(**trans)

    async def get_user_transactions(self, user_id: str) -> list[Transaction]:
        transactions = []
        async for trans in self.db.transactions.find({"user_id": user_id}):
            transactions.append(Transaction(**trans))
        return transactions

    async def get_group_transactions(self, group_id: str) -> list[Transaction]:
        transactions = []
        async for trans in self.db.transactions.find({"equb_id": group_id}):
            transactions.append(Transaction(**trans))
        return transactions

    async def update_transaction(self, transaction_id: str, update_data: TransactionUpdate) -> Transaction:
        update_dict = update_data.dict(exclude_unset=True)
        update_dict['updated_at'] = datetime.utcnow()
        result = await self.db.transactions.update_one(
            {"_id": transaction_id},
            {"$set": update_dict}
        )
        if result.modified_count == 0:
            raise ValueError("Transaction not found or no changes made")
        return await self.get_transaction_by_id(transaction_id)