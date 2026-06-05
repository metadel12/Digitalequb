"""
Receipt Generation and Management Service
Handles automatic receipt generation, storage, and retrieval
"""
from datetime import datetime
from typing import Optional, Dict, Any
import uuid
from jinja2 import Template
from pymongo.database import Database
from app.models.payment_proof import PaymentProof
import json


class ReceiptService:
    """Service for generating and managing payment receipts"""
    
    def __init__(self, db: Database):
        self.db = db
        self.receipts_collection = db.payment_receipts
        self.payment_proofs_collection = db.payment_proofs
    
    def generate_receipt_number(self) -> str:
        """Generate unique receipt number"""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_suffix = str(uuid.uuid4())[:8].upper()
        return f"RCP-{timestamp}-{random_suffix}"
    
    def generate_receipt_html(
        self,
        receipt_number: str,
        group_name: str,
        user_name: str,
        amount: float,
        currency: str = "ETB",
        payment_method: str = "Wallet",
        round_number: int = 1,
        transaction_reference: Optional[str] = None,
        additional_info: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate HTML receipt"""
        
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        template_str = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Receipt - {{ receipt_number }}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f5f5f5;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #007bff;
                    font-size: 28px;
                    margin-bottom: 5px;
                }
                .header p {
                    color: #666;
                    font-size: 12px;
                }
                .receipt-number {
                    background: #f0f0f0;
                    padding: 10px 15px;
                    border-radius: 4px;
                    margin-top: 10px;
                    font-weight: bold;
                    color: #333;
                }
                .content {
                    margin-bottom: 30px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 10px;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .label {
                    color: #666;
                    font-weight: 500;
                }
                .value {
                    color: #333;
                    font-weight: bold;
                }
                .amount-section {
                    background: #e8f4f8;
                    padding: 20px;
                    border-radius: 4px;
                    border-left: 4px solid #007bff;
                }
                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                .amount-row:last-child {
                    margin-bottom: 0;
                }
                .amount-value {
                    font-weight: bold;
                    color: #007bff;
                    font-size: 20px;
                }
                .status {
                    background: #d4edda;
                    color: #155724;
                    padding: 12px 15px;
                    border-radius: 4px;
                    border-left: 4px solid #28a745;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .footer {
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                    margin-top: 30px;
                }
                .qr-section {
                    text-align: center;
                    margin-top: 20px;
                }
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    .container {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💳 DigiEqub Payment Receipt</h1>
                    <p>Automatic Payment Confirmation</p>
                    <div class="receipt-number">Receipt: {{ receipt_number }}</div>
                </div>
                
                <div class="status">
                    ✓ PENDING ADMIN APPROVAL
                </div>
                
                <div class="content">
                    <!-- Payment Details -->
                    <div class="section">
                        <div class="section-title">Payment Information</div>
                        <div class="row">
                            <span class="label">Group Name:</span>
                            <span class="value">{{ group_name }}</span>
                        </div>
                        <div class="row">
                            <span class="label">Round Number:</span>
                            <span class="value">#{{ round_number }}</span>
                        </div>
                        <div class="row">
                            <span class="label">Payment Method:</span>
                            <span class="value">{{ payment_method }}</span>
                        </div>
                        {% if transaction_reference %}
                        <div class="row">
                            <span class="label">Reference:</span>
                            <span class="value">{{ transaction_reference }}</span>
                        </div>
                        {% endif %}
                    </div>
                    
                    <!-- Payer Details -->
                    <div class="section">
                        <div class="section-title">Payer Information</div>
                        <div class="row">
                            <span class="label">Name:</span>
                            <span class="value">{{ user_name }}</span>
                        </div>
                        <div class="row">
                            <span class="label">Timestamp:</span>
                            <span class="value">{{ timestamp }}</span>
                        </div>
                    </div>
                    
                    <!-- Amount -->
                    <div class="amount-section">
                        <div class="amount-row">
                            <span class="label">Amount</span>
                            <span class="amount-value">{{ amount | int }} {{ currency }}</span>
                        </div>
                    </div>
                    
                    <!-- Terms -->
                    <div class="section" style="margin-top: 30px; font-size: 12px; color: #999;">
                        <p>This receipt confirms that payment has been submitted and is awaiting admin verification. The payment will be processed after approval. Please keep this receipt for your records.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>DigiEqub Payment System © 2024</p>
                    <p>Generated on {{ timestamp }}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(template_str)
        html = template.render(
            receipt_number=receipt_number,
            group_name=group_name,
            user_name=user_name,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            round_number=round_number,
            transaction_reference=transaction_reference,
            timestamp=timestamp
        )
        
        return html
    
    def create_auto_receipt(
        self,
        user_id: str,
        group_id: str,
        group_name: str,
        user_name: str,
        amount: float,
        round_number: int = 1,
        payment_method: str = "Wallet",
        transaction_reference: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create automatic receipt for payment"""
        
        receipt_number = self.generate_receipt_number()
        
        # Generate HTML receipt
        html_content = self.generate_receipt_html(
            receipt_number=receipt_number,
            group_name=group_name,
            user_name=user_name,
            amount=amount,
            payment_method=payment_method,
            round_number=round_number,
            transaction_reference=transaction_reference
        )
        
        # Store receipt
        receipt_doc = {
            "_id": str(uuid.uuid4()),
            "receipt_number": receipt_number,
            "user_id": user_id,
            "group_id": group_id,
            "group_name": group_name,
            "user_name": user_name,
            "amount": amount,
            "round_number": round_number,
            "payment_method": payment_method,
            "transaction_reference": transaction_reference,
            "html_content": html_content,
            "status": "pending",  # pending, approved, rejected
            "created_at": datetime.utcnow(),
            "approved_at": None,
            "approved_by": None,
        }
        
        result = self.receipts_collection.insert_one(receipt_doc)
        receipt_doc["_id"] = str(result.inserted_id)
        
        return receipt_doc
    
    def get_receipt(self, receipt_id: str) -> Optional[Dict[str, Any]]:
        """Get receipt by ID"""
        receipt = self.receipts_collection.find_one({"_id": receipt_id})
        if receipt:
            receipt["_id"] = str(receipt["_id"])
        return receipt
    
    def get_receipt_by_number(self, receipt_number: str) -> Optional[Dict[str, Any]]:
        """Get receipt by receipt number"""
        receipt = self.receipts_collection.find_one({"receipt_number": receipt_number})
        if receipt:
            receipt["_id"] = str(receipt["_id"])
        return receipt
    
    def approve_receipt(self, receipt_id: str, approved_by: str) -> bool:
        """Approve a receipt"""
        result = self.receipts_collection.update_one(
            {"_id": receipt_id},
            {
                "$set": {
                    "status": "approved",
                    "approved_at": datetime.utcnow(),
                    "approved_by": approved_by
                }
            }
        )
        return result.modified_count > 0
    
    def reject_receipt(self, receipt_id: str, rejected_by: str, reason: str = "") -> bool:
        """Reject a receipt"""
        result = self.receipts_collection.update_one(
            {"_id": receipt_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": datetime.utcnow(),
                    "rejected_by": rejected_by,
                    "rejection_reason": reason
                }
            }
        )
        return result.modified_count > 0
    
    def get_pending_receipts(self, group_id: Optional[str] = None, limit: int = 50, skip: int = 0) -> list:
        """Get pending receipts for approval"""
        query = {"status": "pending"}
        if group_id:
            query["group_id"] = group_id
        
        receipts = list(
            self.receipts_collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return [{"_id": str(r["_id"]), **{k: v for k, v in r.items() if k != "_id"}} for r in receipts]
