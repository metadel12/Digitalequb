from pydantic import BaseModel
from typing import Optional, Dict, Any

class AdminStats(BaseModel):
    total_users: int
    total_groups: int
    total_transactions: int
    active_groups: int

class SystemConfig(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None