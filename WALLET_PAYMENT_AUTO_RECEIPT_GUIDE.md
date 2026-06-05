# Wallet Payment with Auto-Receipt System - Implementation Guide

## Overview

This system enables users to make payments via DigiEqub wallet with **automatic receipt generation** and **pending admin approval workflow** - all without blocking email notifications or the payment process.

### Key Features

✅ **Automatic Receipt Generation** - HTML receipts created instantly
✅ **Wallet Payment** - Fast, direct from wallet balance  
✅ **Pending Status** - Shows "awaiting admin approval" to user
✅ **Non-blocking Notifications** - Emails sent asynchronously
✅ **Admin Approval Workflow** - Simple approval/rejection interface
✅ **Fast Processing** - Optimistic updates on frontend
✅ **Financial Integrity** - Wallet debited only after admin approval

## System Architecture

### Backend Components

#### 1. Receipt Service (`app/services/receipt_service.py`)
- **Auto-generates** HTML receipts with unique numbers
- **Stores receipts** in MongoDB
- **Tracks receipt status** (pending → approved → rejected)
- **Provides retrieval** for users and admins

**Key Methods:**
```python
generate_receipt_number()          # Creates unique receipt ID
generate_receipt_html()            # Creates HTML receipt
create_auto_receipt()              # Main auto-generation method
approve_receipt()                  # Admin approval
reject_receipt()                   # Admin rejection
get_pending_receipts()             # For admin dashboard
```

#### 2. Payment Endpoints (`app/api/v1/payments.py`)

**Wallet Payment Submission:**
```
POST /api/v1/payments/submit-via-wallet
```
- Validates wallet balance
- Auto-generates receipt
- Creates pending payment record
- Sends async notifications
- Returns immediately with payment ID

**Admin Approval:**
```
POST /api/v1/payments/approve-wallet/{payment_id}
```
- Approves receipt
- Debits wallet
- Updates group member status
- Sends confirmation email

**Payment Status:**
```
GET /api/v1/payments/wallet-payments/status/{payment_id}
```
- User checks payment status
- Shows pending/completed/rejected

### Frontend Components

#### 1. Enhanced Payment Form (`components/payments/EnhancedPaymentForm.jsx`)

**Three-Step Payment Selection:**
1. **Choose Method** - Wallet or Bank Transfer
2. **Process** - Payment details or proof upload
3. **Confirmation** - Receipt and status

**Wallet Payment Flow:**
```jsx
User selects "Wallet" 
  ↓
Views balance & amount
  ↓
Clicks "Complete Payment"
  ↓
Backend auto-generates receipt
  ↓
Shows "Pending Admin Approval" status
  ↓
User can navigate away (payments tracked by payment_id)
  ↓
Admin approves → wallet debited → email sent
```

## Implementation Steps

### Step 1: Verify Backend Services

```bash
# Check receipt service exists
ls -la backend/app/services/receipt_service.py

# Check payment endpoints added
grep -n "submit-via-wallet" backend/app/api/v1/payments.py
grep -n "approve-wallet" backend/app/api/v1/payments.py
```

### Step 2: Update Frontend Imports

In your payment-related pages, import the new component:

```javascript
import EnhancedPaymentForm from '@/components/payments/EnhancedPaymentForm';

// Use it instead of old PaymentForm
<EnhancedPaymentForm 
  groupId={groupId}
  groupName={group.name}
  amount={contribution_amount}
  onSuccess={handlePaymentSuccess}
/>
```

### Step 3: Update Group Details Page

Replace old payment form with new one:

```jsx
// In GroupDetails.jsx or similar
import EnhancedPaymentForm from '@/components/payments/EnhancedPaymentForm';

{showPaymentModal && (
  <EnhancedPaymentForm
    groupId={selectedGroup._id}
    groupName={selectedGroup.name}
    amount={selectedGroup.contribution_amount}
    onSuccess={() => {
      setShowPaymentModal(false);
      refreshGroupData();
    }}
  />
)}
```

### Step 4: Create Admin Payment Dashboard

Create new admin component to manage pending payments:

```jsx
// File: components/admin/PendingPaymentsDashboard.jsx
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function PendingPaymentsDashboard({ groupId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, [groupId]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/wallet-payments/pending', {
        params: { group_id: groupId }
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      const response = await api.post(`/payments/approve-wallet/${paymentId}`, {
        notes: 'Approved by admin'
      });
      
      if (response.data.success) {
        toast.success('Payment approved!');
        fetchPendingPayments();
      }
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pending Wallet Payments</h2>
      
      {payments.length === 0 ? (
        <p className="text-gray-500">No pending payments</p>
      ) : (
        <div className="grid gap-4">
          {payments.map(payment => (
            <div key={payment._id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{payment.user_name}</p>
                  <p className="text-sm text-gray-600">
                    {payment.amount.toLocaleString()} ETB
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Pending
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Receipt: {payment.receipt_number}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(payment._id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(payment._id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Testing Guide

### Test 1: Wallet Payment Submission

**Objective:** Verify payment submission and receipt generation

```bash
# 1. Get user with wallet balance
curl -X GET http://localhost:8000/api/v1/wallet/balance \
  -H "Authorization: Bearer USER_TOKEN"

# Expected: { balance: 50000 }

# 2. Submit wallet payment
curl -X POST http://localhost:8000/api/v1/payments/submit-via-wallet \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": "group-123",
    "amount": 1000,
    "round_number": 1,
    "payment_type": "contribution"
  }'

# Expected response:
{
  "success": true,
  "message": "Payment submitted successfully. Awaiting admin approval.",
  "payment_id": "pw_abc123def456",
  "receipt_id": "RCP-20240529120000-ABC12345",
  "receipt_number": "RCP-20240529120000-ABC12345",
  "status": "pending",
  "amount": 1000
}
```

**Verify Receipt Generated:**
```bash
# Check MongoDB
db.payment_receipts.findOne({"receipt_number": "RCP-20240529120000-ABC12345"})

# Should show:
{
  "_id": "...",
  "receipt_number": "RCP-...",
  "status": "pending",
  "html_content": "<!DOCTYPE html>...",
  "user_id": "user-...",
  "group_id": "group-123",
  "amount": 1000,
  "created_at": ISODate(...)
}
```

### Test 2: Admin Approval

**Objective:** Verify admin can approve and wallet is debited

```bash
# 1. Get pending payments (admin only)
curl -X GET http://localhost:8000/api/v1/payments/wallet-payments/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: Array of pending payments

# 2. Approve payment
curl -X POST http://localhost:8000/api/v1/payments/approve-wallet/pw_abc123def456 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Payment verified"
  }'

# Expected:
{
  "success": true,
  "message": "Payment approved and processed successfully",
  "payment_id": "pw_abc123def456",
  "status": "completed"
}

# 3. Verify wallet was debited
curl -X GET http://localhost:8000/api/v1/wallet/balance \
  -H "Authorization: Bearer USER_TOKEN"

# Expected: balance reduced by 1000
```

### Test 3: Payment Status Tracking

**Objective:** Verify user can check payment status

```bash
# Check payment status
curl -X GET http://localhost:8000/api/v1/payments/wallet-payments/status/pw_abc123def456 \
  -H "Authorization: Bearer USER_TOKEN"

# Responses:
# Pending: { "status": "pending", ... }
# Completed: { "status": "completed", "approved_at": "...", ... }
# Rejected: { "status": "rejected", ... }
```

### Test 4: Email Notifications (Non-Blocking)

**Objective:** Verify emails sent asynchronously

1. **On payment submission:**
   - Email should arrive in inbox within 5 seconds
   - Subject: "Payment Submitted - Pending Admin Approval"
   - Contains receipt number and status

2. **On admin approval:**
   - Email should arrive within 5 seconds
   - Subject: "Payment Approved - [Group Name]"
   - Shows wallet has been debited

**Check Email Logs:**
```bash
# Check backend logs
tail -f backend/logs/app.log | grep -i "email\|notification"

# Or check sent emails collection
db.sent_emails.find().sort({ created_at: -1 }).limit(5)
```

### Test 5: Insufficient Balance

**Objective:** Verify proper error handling

```javascript
// Frontend: Try to pay with insufficient balance
<EnhancedPaymentForm
  amount={100000}  // More than wallet has
/>

// Expected: "Insufficient wallet balance" error
// Button should be disabled
```

### Test 6: Rejection Flow

**Objective:** Verify payment rejection

```bash
# Admin rejects payment
curl -X POST http://localhost:8000/api/v1/payments/reject/pw_abc123def456 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Duplicate payment detected"
  }'

# User should receive rejection email
# Payment status shows "rejected"
```

## API Reference

### Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/payments/submit-via-wallet` | User | Submit wallet payment |
| GET | `/payments/wallet-payments/pending` | Admin | List pending payments |
| GET | `/payments/wallet-payments/status/{id}` | User/Admin | Check status |
| POST | `/payments/approve-wallet/{id}` | Admin | Approve payment |
| GET | `/payments/receipt/{receipt_id}` | User/Admin | Get receipt HTML |

### Request/Response Examples

**Submit Wallet Payment:**
```json
POST /api/v1/payments/submit-via-wallet

Request:
{
  "group_id": "group-123",
  "amount": 1000,
  "round_number": 1,
  "payment_type": "contribution"
}

Response:
{
  "success": true,
  "message": "Payment submitted successfully. Awaiting admin approval.",
  "payment_id": "pw_xxx",
  "receipt_id": "RCP_xxx",
  "receipt_number": "RCP-20240529-ABC",
  "status": "pending",
  "amount": 1000,
  "created_at": "2024-05-29T12:00:00Z"
}
```

**Approve Payment:**
```json
POST /api/v1/payments/approve-wallet/{payment_id}

Request:
{
  "notes": "Verified and approved"
}

Response:
{
  "success": true,
  "message": "Payment approved and processed successfully",
  "payment_id": "pw_xxx",
  "status": "completed"
}
```

## Database Schema

### wallet_payments Collection
```javascript
{
  "_id": "pw_xxx",
  "user_id": "user-123",
  "group_id": "group-456",
  "group_name": "Saving Group A",
  "user_name": "John Doe",
  "amount": 1000,
  "currency": "ETB",
  "payment_type": "contribution",
  "round_number": 1,
  "payment_method": "wallet",
  "status": "pending|completed|rejected",
  "receipt_id": "RCP_xxx",
  "receipt_number": "RCP-20240529-ABC",
  "wallet_pending": true,
  "created_at": ISODate("..."),
  "updated_at": ISODate("..."),
  "approved_at": ISODate("...") || null,
  "approved_by": "admin-789" || null,
  "admin_notes": "..." || null
}
```

### payment_receipts Collection
```javascript
{
  "_id": "RCP_xxx",
  "receipt_number": "RCP-20240529-ABC",
  "user_id": "user-123",
  "group_id": "group-456",
  "group_name": "Saving Group A",
  "user_name": "John Doe",
  "amount": 1000,
  "round_number": 1,
  "payment_method": "DigiEqub Wallet",
  "transaction_reference": "pw_xxx",
  "html_content": "<!DOCTYPE html>...",
  "status": "pending|approved|rejected",
  "created_at": ISODate("..."),
  "approved_at": ISODate("...") || null,
  "approved_by": "admin-789" || null
}
```

## Troubleshooting

### Issue: Payment Not Submitted

**Symptoms:** Form shows error when submitting payment

**Solutions:**
1. Check wallet balance: `GET /wallet/balance`
2. Verify user is group member
3. Check server logs for errors: `tail -f backend/logs/app.log`
4. Ensure group exists: `db.groups.findOne({"_id": "group-id"})`

### Issue: Receipt Not Generated

**Symptoms:** Receipt number not returned

**Solutions:**
1. Check receipt service is running
2. Verify MongoDB connection
3. Check `payment_receipts` collection exists
4. Review backend logs for receipt generation errors

### Issue: Email Not Received

**Symptoms:** User doesn't receive approval email

**Solutions:**
1. Check email service configuration in `.env`
2. Verify SMTP credentials
3. Check `sent_emails` collection
4. Review email logs: `tail -f backend/logs/email.log`

### Issue: Wallet Not Debited After Approval

**Symptoms:** Admin approves but wallet balance unchanged

**Solutions:**
1. Verify `wallet_pending` flag is set to False
2. Check wallet_transactions collection for entry
3. Verify user wallet document exists
4. Check admin user has correct permissions

## Performance Considerations

### Fast Processing
- **Optimistic Updates:** Frontend updates balance immediately
- **Async Notifications:** Emails sent in background threads
- **Payment ID:** Returned instantly before wallet debit
- **Typical Response Time:** < 500ms for payment submission

### Scalability
- **No blocking operations:** All notifications async
- **MongoDB indexing:** On group_id, user_id, status
- **Email queuing:** Prevents email overload
- **Background workers:** Process approvals independently

## Security Checklist

- [ ] Only admins can approve payments
- [ ] Wallet balance verified before payment
- [ ] User can't modify their own payment status
- [ ] Receipt HTML sanitized (no XSS)
- [ ] Transaction reference is unique
- [ ] All API calls require authentication
- [ ] Admin actions are logged
- [ ] Email addresses validated

## Next Steps

1. **Deploy receipt service:** Push `app/services/receipt_service.py`
2. **Update payment endpoints:** Deploy updated `app/api/v1/payments.py`
3. **Deploy frontend component:** Push `EnhancedPaymentForm.jsx`
4. **Update payment pages:** Use new component in group details
5. **Create admin dashboard:** For managing pending payments
6. **Test end-to-end:** Follow testing guide above
7. **Monitor logs:** Watch for errors during initial deployment

---

**Last Updated:** May 29, 2024
**Version:** 1.0
**Status:** Ready for Deployment
