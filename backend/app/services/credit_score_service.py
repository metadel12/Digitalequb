from datetime import datetime

class CreditScoreService:
    def __init__(self, db):
        self.db = db

    async def calculate_credit_score(self, user_id: str) -> int:
        # Simple calculation based on transaction history
        # In real implementation, this would be more complex
        transactions = await self.db.transactions.find({"user_id": user_id, "status": "completed"}).to_list(length=None)
        score = 300  # Base score
        for trans in transactions:
            if trans['type'] == 'contribution':
                score += 10
            elif trans['type'] == 'payout':
                score += 5
        return min(score, 850)  # Max 850

    async def get_credit_score(self, user_id: str) -> dict:
        score = await self.calculate_credit_score(user_id)
        return {"user_id": user_id, "credit_score": score, "calculated_at": datetime.utcnow()}