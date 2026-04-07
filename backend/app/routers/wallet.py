from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pymongo.database import Database

from ..core.database import get_db
from ..dependencies import get_current_user
from ..schemas.wallet import (
    AdminWithdrawalActionRequest,
    AutoWithdrawSetupRequest,
    DepositInitiateRequest,
    DepositInitiateResponse,
    DepositRequestResponse,
    WalletBalanceResponse,
    WalletResponse,
    WalletStatementResponse,
    WalletStatsResponse,
    WalletTransactionHistoryResponse,
    WithdrawalInitiateRequest,
    WithdrawalInitiateResponse,
    WithdrawalRequestResponse,
    WinningDetailsResponse,
)
from ..services.cbe_service import CommercialBankOfEthiopiaService
from ..services.wallet_service import WalletService
from ..services.winner_service import WinnerService

router = APIRouter()


@router.get("", response_model=WalletResponse)
async def get_wallet(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).get_wallet_by_user_id(current_user["_id"])


@router.get("/balance", response_model=WalletBalanceResponse)
async def get_wallet_balance(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).get_wallet_balance(current_user["_id"])


@router.get("/bank-account/balance")
async def get_bank_account_balance(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return await WalletService(db).get_bank_account_balance(current_user["_id"])
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/deposit", response_model=DepositInitiateResponse)
async def initiate_deposit(deposit_data: DepositInitiateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).initiate_deposit(current_user["_id"], deposit_data)


@router.post("/deposit/confirm")
async def confirm_deposit(reference: str = Body(..., embed=True), transaction_hash: Optional[str] = Body(None, embed=True), db: Database = Depends(get_db)):
    if not WalletService(db).confirm_deposit(reference, transaction_hash):
        raise HTTPException(status_code=404, detail="Deposit transaction not found")
    return {"message": "Deposit confirmed"}


@router.get("/deposit/{reference}", response_model=DepositRequestResponse)
async def get_deposit_details(reference: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return WalletService(db).get_deposit_by_reference(current_user["_id"], reference)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/withdraw", response_model=WithdrawalInitiateResponse)
async def initiate_withdrawal(withdrawal_data: WithdrawalInitiateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return WalletService(db).initiate_withdrawal(current_user["_id"], withdrawal_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/withdraw/{withdrawal_id}", response_model=WithdrawalRequestResponse)
async def get_withdrawal_details(withdrawal_id: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return WalletService(db).get_withdrawal_details(current_user["_id"], withdrawal_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/withdraw/{withdrawal_id}")
async def cancel_withdrawal(withdrawal_id: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        WalletService(db).cancel_withdrawal(current_user["_id"], withdrawal_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"message": "Withdrawal cancelled"}


@router.get("/transactions", response_model=WalletTransactionHistoryResponse)
async def get_transaction_history(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), transaction_type: Optional[str] = Query(None), current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).get_transaction_history(current_user["_id"], page, page_size, transaction_type)


@router.get("/stats", response_model=WalletStatsResponse)
async def get_wallet_stats(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).get_wallet_stats(current_user["_id"])


@router.get("/winning/{group_id}", response_model=WinningDetailsResponse)
async def get_winning_details(group_id: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).get_winning_details(current_user["_id"], group_id)


@router.post("/auto-withdraw/setup", response_model=WalletResponse)
async def setup_auto_withdraw(payload: AutoWithdrawSetupRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).setup_auto_withdraw(current_user["_id"], payload)


@router.get("/statement", response_model=WalletStatementResponse)
async def get_statement(from_date: Optional[datetime] = None, to_date: Optional[datetime] = None, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    return WalletService(db).generate_statement(current_user["_id"], from_date, to_date)


@router.get("/admin/withdrawals", response_model=List[WithdrawalRequestResponse])
async def get_admin_withdrawals(status_filter: Optional[str] = Query(None), current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") not in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}:
        raise HTTPException(status_code=403, detail="Admin access required")
    txs = list(db["wallet_transactions"].find({"type": "withdrawal", **({"status": status_filter} if status_filter else {})}).sort("created_at", -1))
    items = []
    for tx in txs:
        meta = tx.get("transaction_metadata", {}) if isinstance(tx.get("transaction_metadata"), dict) else {}
        destination = meta.get("destination_details", {}) if isinstance(meta, dict) else {}
        items.append(
            {
                "id": tx["_id"],
                "wallet_id": tx["wallet_id"],
                "amount": abs(tx.get("amount", 0.0)),
                "fee": tx.get("fee", 0.0),
                "net_amount": tx.get("net_amount", 0.0),
                "method": tx.get("payment_method"),
                "status": tx.get("status", "pending"),
                "priority": "normal",
                "bank_name": destination.get("bank_name"),
                "account_name": destination.get("account_name"),
                "account_number": destination.get("account_number"),
                "mobile_provider": destination.get("mobile_provider"),
                "mobile_number": destination.get("mobile_number"),
                "crypto_address": destination.get("crypto_address"),
                "cash_pickup_location": destination.get("cash_pickup_location"),
                "reference": tx.get("reference"),
                "estimated_completion": None,
                "admin_notes": None,
                "processed_by": None,
                "processed_at": None,
                "rejected_reason": None,
                "created_at": tx.get("created_at"),
                "updated_at": tx.get("updated_at"),
            }
        )
    return items


@router.put("/admin/withdrawals/{withdrawal_id}")
async def process_withdrawal(withdrawal_id: str, payload: AdminWithdrawalActionRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") not in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}:
        raise HTTPException(status_code=403, detail="Admin access required")
    if not WalletService(db).process_withdrawal_request(withdrawal_id, current_user["_id"], payload.action, payload.notes):
        raise HTTPException(status_code=404, detail="Withdrawal request not found")
    return {"message": f"Withdrawal {payload.action}d successfully"}


@router.post("/admin/transfer-winning")
async def transfer_winning(winner_id: str = Body(..., embed=True), group_id: str = Body(..., embed=True), amount: float = Body(..., embed=True), description: str = Body("", embed=True), current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") not in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = WalletService(db).transfer_winning(winner_id, group_id, amount, description)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Winning transfer failed")
    return {"message": "Winning transferred successfully"}


@router.get("/admin/transactions", response_model=WalletTransactionHistoryResponse)
async def get_admin_transactions(user_id: Optional[str] = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), transaction_type: Optional[str] = Query(None), current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") not in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}:
        raise HTTPException(status_code=403, detail="Admin access required")
    target_user_id = user_id or current_user["_id"]
    return WalletService(db).get_transaction_history(target_user_id, page, page_size, transaction_type)


@router.get("/admin/system-wallet")
async def get_admin_system_wallet(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    if current_user.get("role") not in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}:
        raise HTTPException(status_code=403, detail="Admin access required")
    return WinnerService(db).get_system_wallet_summary()
