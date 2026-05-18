# Partial Payment API Guide

## Overview
Members can now contribute any amount from **0.01 Birr** up to the **expected contribution amount**. The system will calculate proportional payouts when they win.

---

## API Endpoints

### 1. Contribute via Wallet (Recommended)

**Endpoint:** `POST /api/v1/groups/{group_id}/contribute`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50,
  "payment_method": "wallet"
}
```

**Example: Pay 50 Birr (Half of 100 Birr expected)**
```bash
curl -X POST "https://api.digitequb.com/api/v1/groups/group-123/contribute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "payment_method": "wallet"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Contribution successful",
  "transaction_id": "tx-abc123",
  "amount": 50,
  "balance_after": 450.00,
  "group_name": "test eqube",
  "round_number": 1
}
```

**Error Response (Insufficient Balance):**
```json
{
  "detail": "Insufficient wallet balance. Available balance is 30 ETB"
}
```

---

### 2. Contribute via Bank Transfer

**Endpoint:** `POST /api/v1/groups/{group_id}/contribute`

**Request Body:**
```json
{
  "amount": 75,
  "payment_method": "bank",
  "transaction_reference": "CBE-TXN-123456789",
  "proof_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Example: Pay 75 Birr (75% of 100 Birr expected)**
```bash
curl -X POST "https://api.digitequb.com/api/v1/groups/group-123/contribute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 75,
    "payment_method": "bank",
    "transaction_reference": "CBE-TXN-123456789",
    "proof_image": "base64_encoded_image"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment proof submitted successfully. Waiting for admin verification.",
  "payment_id": "pv_group-123_user-456_1",
  "round_number": 1,
  "status": "pending"
}
```

---

### 3. Contribute via Mobile Money (Telebirr)

**Endpoint:** `POST /api/v1/groups/{group_id}/contribute`

**Request Body:**
```json
{
  "amount": 25,
  "payment_method": "telebirr",
  "transaction_reference": "TELEBIRR-987654321"
}
```

**Example: Pay 25 Birr (25% of 100 Birr expected)**
```bash
curl -X POST "https://api.digitequb.com/api/v1/groups/group-123/contribute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25,
    "payment_method": "telebirr",
    "transaction_reference": "TELEBIRR-987654321"
  }'
```

---

## Query Parameters (Alternative)

You can also pass parameters as query strings:

```bash
POST /api/v1/groups/{group_id}/contribute?amount=50&payment_method=wallet
```

**Example:**
```bash
curl -X POST "https://api.digitequb.com/api/v1/groups/group-123/contribute?amount=50&payment_method=wallet" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Validation Rules

### Amount Validation
- **Minimum:** > 0 Birr (must be greater than zero)
- **Maximum:** ≤ Expected contribution amount
- **Examples:**
  - ✅ Expected: 100 Birr, Paid: 50 Birr (Valid)
  - ✅ Expected: 100 Birr, Paid: 0.01 Birr (Valid)
  - ✅ Expected: 100 Birr, Paid: 100 Birr (Valid)
  - ❌ Expected: 100 Birr, Paid: 0 Birr (Invalid - must be > 0)
  - ❌ Expected: 100 Birr, Paid: 150 Birr (Invalid - exceeds expected)
  - ❌ Expected: 100 Birr, Paid: -50 Birr (Invalid - negative)

### Payment Method Validation
- **Valid values:** `wallet`, `bank`, `mobile`, `telebirr`
- **Note:** `mobile` is automatically converted to `telebirr`

---

## Frontend Integration Examples

### React/JavaScript Example

```javascript
// Pay 50 Birr via wallet
async function payPartialContribution(groupId, amount) {
  try {
    const response = await fetch(`/api/v1/groups/${groupId}/contribute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        payment_method: 'wallet'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Payment successful:', data);
      alert(`Successfully paid ${amount} Birr!`);
    } else {
      console.error('Payment failed:', data.detail);
      alert(`Payment failed: ${data.detail}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error occurred');
  }
}

// Usage
payPartialContribution('group-123', 50);
```

### Python Example

```python
import requests

def pay_partial_contribution(group_id, amount, access_token):
    url = f"https://api.digitequb.com/api/v1/groups/{group_id}/contribute"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "amount": amount,
        "payment_method": "wallet"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Payment successful: {data}")
        return data
    else:
        error = response.json()
        print(f"Payment failed: {error.get('detail')}")
        return None

# Usage
pay_partial_contribution('group-123', 50, 'your_access_token')
```

---

## Common Scenarios

### Scenario 1: Pay Half Amount
```json
{
  "amount": 50,
  "payment_method": "wallet"
}
```
**Result:** When you win, you'll receive 50% of the normal winner payout.

### Scenario 2: Pay Quarter Amount
```json
{
  "amount": 25,
  "payment_method": "wallet"
}
```
**Result:** When you win, you'll receive 25% of the normal winner payout.

### Scenario 3: Pay Full Amount
```json
{
  "amount": 100,
  "payment_method": "wallet"
}
```
**Result:** When you win, you'll receive 100% of the normal winner payout.

### Scenario 4: Pay Minimum Amount
```json
{
  "amount": 1,
  "payment_method": "wallet"
}
```
**Result:** When you win, you'll receive 1% of the normal winner payout.

---

## Error Handling

### Common Errors

#### 1. Insufficient Wallet Balance
```json
{
  "detail": "Insufficient wallet balance. Available balance is 30 ETB"
}
```
**Solution:** Top up your wallet before making the payment.

#### 2. Amount Exceeds Expected
```json
{
  "detail": "Contribution amount must be between 0 and 100 ETB"
}
```
**Solution:** Reduce the amount to the expected contribution or less.

#### 3. Invalid Amount (Zero or Negative)
```json
{
  "detail": "Contribution amount must be between 0 and 100 ETB"
}
```
**Solution:** Provide a positive amount greater than zero.

#### 4. Already Paid for Current Round
```json
{
  "detail": "You have already paid for the current round"
}
```
**Solution:** Wait for the next round to make another contribution.

#### 5. Not a Group Member
```json
{
  "detail": "Only group members can contribute"
}
```
**Solution:** Join the group first before making contributions.

---

## Testing with Postman

### Step 1: Set Up Environment Variables
- `base_url`: `https://api.digitequb.com`
- `access_token`: Your authentication token
- `group_id`: The group ID you want to contribute to

### Step 2: Create Request
1. Method: `POST`
2. URL: `{{base_url}}/api/v1/groups/{{group_id}}/contribute`
3. Headers:
   - `Authorization`: `Bearer {{access_token}}`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "amount": 50,
  "payment_method": "wallet"
}
```

### Step 3: Send Request
Click "Send" and verify the response.

---

## Mobile App Integration

### Flutter/Dart Example

```dart
Future<void> payPartialContribution(String groupId, double amount) async {
  final url = Uri.parse('https://api.digitequb.com/api/v1/groups/$groupId/contribute');
  
  try {
    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'amount': amount,
        'payment_method': 'wallet',
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Payment successful: $data');
      // Show success message to user
    } else {
      final error = jsonDecode(response.body);
      print('Payment failed: ${error['detail']}');
      // Show error message to user
    }
  } catch (e) {
    print('Error: $e');
    // Handle network error
  }
}
```

---

## Best Practices

1. **Validate Amount on Frontend:** Check amount is > 0 and ≤ expected before sending request
2. **Show Expected Amount:** Display the expected contribution amount to users
3. **Show Percentage:** Show users what percentage they're paying (e.g., "50 Birr (50%)")
4. **Explain Impact:** Inform users that partial payments result in proportional winnings
5. **Handle Errors Gracefully:** Provide clear error messages to users
6. **Confirm Before Payment:** Show confirmation dialog with amount and percentage
7. **Update UI After Payment:** Refresh group status and wallet balance after successful payment

---

## Support

For issues or questions, contact:
- Email: support@digitequb.com
- Phone: +251-XXX-XXXX
