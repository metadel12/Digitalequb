import uuid
from datetime import UTC, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database

from ..core.database import get_db
from ..core.mongo_utils import normalize_datetime, utcnow
from ..dependencies import get_current_user
from ..schemas.profile import (
    AvatarPayload,
    BeneficiaryCreateRequest,
    BeneficiaryListResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    ProfileWalletResponse,
)
from ..schemas.wallet import (
    DepositInitiateRequest,
    DepositInitiateResponse,
    WalletStatementResponse,
    WalletTransactionHistoryResponse,
    WithdrawalInitiateRequest,
    WithdrawalInitiateResponse,
)
from ..services.wallet_service import WalletService

router = APIRouter()


def _dt(value):
    parsed = normalize_datetime(value)
    if parsed is None:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _profile_response(current_user: dict) -> ProfileResponse:
    return ProfileResponse(
        id=str(current_user["_id"]),
        full_name=current_user.get("full_name", ""),
        email=current_user.get("email", ""),
        phone_number=current_user.get("phone_number", ""),
        profile_picture=current_user.get("profile_picture"),
        date_of_birth=_dt(current_user.get("date_of_birth")),
        address=current_user.get("address") or {},
        profile_metadata=current_user.get("profile_metadata") or {},
        notification_preferences=current_user.get("notification_preferences") or {},
        privacy_settings=current_user.get("privacy_settings") or {},
        security_settings=current_user.get("security_settings") or {},
        app_settings=current_user.get("app_settings") or {},
    )


def _save_user(db: Database, user: dict) -> dict:
    user["updated_at"] = utcnow()
    db["users"].update_one({"_id": user["_id"]}, {"$set": user})
    return db["users"].find_one({"_id": user["_id"]}) or user


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user=Depends(get_current_user)):
    return _profile_response(current_user)


@router.put("", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    update_data = payload.dict(exclude_unset=True)
    current_user.update(update_data)
    saved = _save_user(db, current_user)
    return _profile_response(saved)


@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(payload: AvatarPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["profile_picture"] = payload.image_data
    return _profile_response(_save_user(db, current_user))


@router.delete("/avatar", response_model=ProfileResponse)
async def delete_avatar(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["profile_picture"] = None
    return _profile_response(_save_user(db, current_user))


@router.get("/wallet", response_model=ProfileWalletResponse)
async def get_profile_wallet(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    service = WalletService(db)
    wallet = service.get_wallet_by_user_id(str(current_user["_id"])) or service.ensure_wallet_for_user(str(current_user["_id"]))
    balance = service.get_wallet_balance(str(current_user["_id"]))
    return ProfileWalletResponse(
        balance=float(balance["balance"]),
        total_deposits=float(balance["total_deposits"]),
        total_withdrawals=float(balance["total_withdrawals"]),
        total_winnings=float(balance["total_winnings"]),
        pending_deposits=float(balance["pending_deposits"]),
        pending_withdrawals=float(balance["pending_withdrawals"]),
        currency=balance["currency"],
        wallet_address=wallet.get("wallet_address"),
        available_balance=float(balance["available_balance"]),
        pending_transactions_count=int(balance["pending_transactions_count"]),
        updated_at=_dt(wallet.get("updated_at")),
    )


@router.get("/transactions", response_model=WalletTransactionHistoryResponse)
async def get_profile_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    transaction_type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
):
    return WalletService(db).get_transaction_history(str(current_user["_id"]), page, page_size, transaction_type)


@router.get("/wallet/statement", response_model=WalletStatementResponse)
async def get_wallet_statement(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
):
    service = WalletService(db)
    parsed_from = datetime.fromisoformat(from_date) if from_date else None
    parsed_to = datetime.fromisoformat(to_date) if to_date else None
    return service.generate_statement(str(current_user["_id"]), parsed_from, parsed_to)


@router.post("/deposit", response_model=DepositInitiateResponse)
async def create_profile_deposit(payload: DepositInitiateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return WalletService(db).initiate_deposit(str(current_user["_id"]), payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/withdraw", response_model=WithdrawalInitiateResponse)
async def create_profile_withdrawal(payload: WithdrawalInitiateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    try:
        return WalletService(db).initiate_withdrawal(str(current_user["_id"]), payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/beneficiaries", response_model=BeneficiaryListResponse)
async def get_beneficiaries(current_user=Depends(get_current_user)):
    data = current_user.get("saved_beneficiaries") or {}
    return BeneficiaryListResponse(
        bank_accounts=data.get("bank_accounts", []),
        mobile_accounts=data.get("mobile_accounts", []),
        crypto_wallets=data.get("crypto_wallets", []),
    )


def _append_beneficiary(user: dict, bucket: str, payload: dict) -> BeneficiaryListResponse:
    current = user.get("saved_beneficiaries") or {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []}
    item = {"id": str(uuid.uuid4()), **payload}
    current[bucket] = [item, *current.get(bucket, [])]
    user["saved_beneficiaries"] = current
    return BeneficiaryListResponse(
        bank_accounts=current.get("bank_accounts", []),
        mobile_accounts=current.get("mobile_accounts", []),
        crypto_wallets=current.get("crypto_wallets", []),
    )


@router.post("/beneficiaries/bank", response_model=BeneficiaryListResponse)
async def save_bank_beneficiary(payload: BeneficiaryCreateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    response = _append_beneficiary(current_user, "bank_accounts", payload.data)
    _save_user(db, current_user)
    return response


@router.post("/beneficiaries/mobile", response_model=BeneficiaryListResponse)
async def save_mobile_beneficiary(payload: BeneficiaryCreateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    response = _append_beneficiary(current_user, "mobile_accounts", payload.data)
    _save_user(db, current_user)
    return response


@router.post("/beneficiaries/crypto", response_model=BeneficiaryListResponse)
async def save_crypto_beneficiary(payload: BeneficiaryCreateRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    response = _append_beneficiary(current_user, "crypto_wallets", payload.data)
    _save_user(db, current_user)
    return response


@router.delete("/beneficiaries/{beneficiary_id}", response_model=BeneficiaryListResponse)
async def delete_beneficiary(beneficiary_id: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    data = current_user.get("saved_beneficiaries") or {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []}
    for bucket in ["bank_accounts", "mobile_accounts", "crypto_wallets"]:
        data[bucket] = [item for item in data.get(bucket, []) if item.get("id") != beneficiary_id]
    current_user["saved_beneficiaries"] = data
    _save_user(db, current_user)
    return BeneficiaryListResponse(
        bank_accounts=data.get("bank_accounts", []),
        mobile_accounts=data.get("mobile_accounts", []),
        crypto_wallets=data.get("crypto_wallets", []),
    )
