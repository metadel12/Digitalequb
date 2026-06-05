from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["digiequb"]

# Check payment_verifications collection
payments = list(db["payment_verifications"].find().sort("submitted_at", -1))
print(f"Total payment verifications: {len(payments)}")

for payment in payments:
    print(f"\nPayment ID: {payment['_id']}")
    print(f"Reference: {payment.get('transaction_reference', 'N/A')}")
    print(f"Amount: {payment.get('amount', 0)} ETB")
    print(f"Status: {payment.get('status', 'unknown')}")
    print(f"Member ID: {payment.get('member_id', 'N/A')}")
    print(f"Group ID: {payment.get('group_id', 'N/A')}")
    print(f"Submitted: {payment.get('submitted_at', 'N/A')}")

# Also check for the specific reference number
specific = db["payment_verifications"].find_one({"transaction_reference": "RCP-20260603054019-BBBF5229"})
if specific:
    print(f"\nFound specific payment:")
    print(f"Status: {specific.get('status')}")
    print(f"Amount: {specific.get('amount')} ETB")
else:
    print("\nSpecific payment RCP-20260603054019-BBBF5229 not found")

# Check wallet_transactions for this reference
wallet_tx = db["wallet_transactions"].find_one({"transaction_reference": "RCP-20260603054019-BBBF5229"})
if wallet_tx:
    print(f"\nFound wallet transaction:")
    print(f"Type: {wallet_tx.get('transaction_type')}")
    print(f"Amount: {wallet_tx.get('amount')} ETB")
    print(f"Status: {wallet_tx.get('status')}")
else:
    print("\nWallet transaction not found")