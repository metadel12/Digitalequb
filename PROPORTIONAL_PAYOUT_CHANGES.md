# Proportional Payout System Implementation

## Overview
The equb system has been updated to support **proportional payouts** based on member contributions. Winners now receive payouts calculated based on their actual contribution percentage.

## Key Changes

### 1. Payout Distribution (90% Winner / 10% System)
- Winners receive **90%** of the total pool (changed from 75%)
- System takes **10%** platform fee (changed from 25%)

### 2. Proportional Payout Calculation
Winners receive payouts proportional to their contribution:
- **Formula**: `Winner Payout = (Total Pool × 90%) × (Winner's Contribution / Expected Contribution)`
- **Example**: 
  - Expected contribution: 100 Birr
  - Winner paid: 50 Birr (50%)
  - Total pool: 500 Birr
  - Winner receives: (500 × 0.90) × 0.50 = **225 Birr**

### 3. Partial Payments Allowed
- Members can now pay any amount between 0 and the expected contribution
- Validation changed from strict equality to range check
- Minimum: > 0 Birr
- Maximum: Expected contribution amount
- **All payment methods support partial payments**: Wallet, Bank Transfer, Mobile Money

## How to Make Partial Payments

### Via Wallet Payment
```json
POST /api/v1/groups/{group_id}/contribute
{
  "amount": 50,
  "payment_method": "wallet"
}
```

### Via Bank Transfer
```json
POST /api/v1/groups/{group_id}/contribute
{
  "amount": 50,
  "payment_method": "bank",
  "transaction_reference": "TXN123456",
  "proof_image": "base64_image_data"
}
```

### Via Mobile Money (Telebirr)
```json
POST /api/v1/groups/{group_id}/contribute
{
  "amount": 50,
  "payment_method": "telebirr",
  "transaction_reference": "TXN123456"
}
```

## Technical Implementation

### Files Modified

#### 1. **Payment Services**
- `app/services/bank_payment_service.py`
  - Updated `WINNER_PAYOUT_RATIO` to 0.90
  - Updated `SYSTEM_PAYOUT_RATIO` to 0.10
  - Removed strict payment validation (allows partial payments)
  - Added `round_contributions` tracking

- `app/services/wallet_service.py`
  - Updated payout ratios to 90/10
  - Added round-specific contribution tracking

- `app/services/auto_pay_service.py`
  - Added round contribution tracking for auto-payments

#### 2. **Winner Selection**
- `app/services/winner_service.py`
  - Updated winner selection to calculate proportional payouts
  - Calculates winner's contribution percentage
  - Applies percentage to base winner amount (90% of pool)
  - Updated notification messages to reflect proportional system
  - Changed metadata percentage from "25%" to "10%"

#### 3. **Payment Verification**
- `app/api/v1/payments.py`
  - Changed validation to allow partial payments
  - Added round contribution tracking on verification

- `app/services/admin_service.py`
  - Updated payout calculations to use 90/10 split
  - Added round contribution tracking

#### 4. **Group Management**
- `app/api/v1/groups.py`
  - Updated default percentages (90/10)
  - Added round contribution tracking for manual payments

#### 5. **Data Models**
- `app/core/mongo_utils.py`
  - Added `round_contributions` field to member initialization
  - Structure: `{"1": 100.0, "2": 50.0, "3": 100.0}` (round_number: amount)

#### 6. **Setup Scripts**
- `scripts/setup_real_system.py`
  - Updated default ratios to 90/10

## Database Schema Changes

### Member Document Structure
```javascript
{
  "user_id": "user-123",
  "contribution_count": 3,
  "total_contributed": 250.0,
  "round_contributions": {
    "1": 100.0,  // Round 1: Full payment
    "2": 50.0,   // Round 2: Partial payment (50%)
    "3": 100.0   // Round 3: Full payment
  },
  // ... other fields
}
```

## Winner Selection Logic

### Old System (Fixed 75/25)
```python
total_collected = contribution_amount × num_members
winner_amount = total_collected × 0.75
system_fee = total_collected × 0.25
```

### New System (Proportional 90/10)
```python
# Calculate actual total collected
total_collected = sum(member.round_contributions[current_round] for member in members)

# Get winner's contribution for this round
winner_contribution = winner.round_contributions[current_round]
winner_percentage = winner_contribution / expected_contribution

# Calculate proportional payout
base_winner_amount = total_collected × 0.90
winner_amount = base_winner_amount × winner_percentage
system_fee = total_collected × 0.10
```

## Examples

### Example 1: Full Payment
- Group: 5 members, 100 Birr each
- Winner paid: 100 Birr (100%)
- Total collected: 500 Birr
- Winner receives: (500 × 0.90) × 1.0 = **450 Birr**
- System receives: 500 × 0.10 = **50 Birr**

### Example 2: Half Payment
- Group: 5 members, 100 Birr each
- Winner paid: 50 Birr (50%)
- Total collected: 450 Birr (4×100 + 1×50)
- Winner receives: (450 × 0.90) × 0.5 = **202.5 Birr**
- System receives: 450 × 0.10 = **45 Birr**

### Example 3: Quarter Payment
- Group: 10 members, 200 Birr each
- Winner paid: 50 Birr (25%)
- Total collected: 1,850 Birr (9×200 + 1×50)
- Winner receives: (1,850 × 0.90) × 0.25 = **416.25 Birr**
- System receives: 1,850 × 0.10 = **185 Birr**

## Notifications

### SMS Messages
- Winner: "Congratulations! You won X ETB from [group]. Your payout is based on your contribution percentage."
- Members: "Winner announcement: [name] won X ETB from [group] in round Y."

### Email Messages
- Includes explanation: "Your payout is calculated based on your contribution percentage (90% of pool × your contribution rate)."

## Benefits

1. **Fairness**: Members who contribute less receive proportionally less when they win
2. **Flexibility**: Allows members to participate even when they can't afford full contribution
3. **Transparency**: Clear calculation based on actual contributions
4. **Incentive**: Encourages full contributions for maximum payout potential

## Migration Notes

- Existing members without `round_contributions` field will default to expected contribution amount
- System gracefully handles missing data by using expected contribution as fallback
- No data migration required - field is added on next payment

## Testing Recommendations

1. Test partial payment submission (50%, 25%, 75% of expected)
2. Test winner selection with mixed contributions
3. Verify payout calculations match expected formulas
4. Test notification messages reflect correct amounts
5. Verify system fee is always 10% of total collected
6. Test edge cases (0.01 Birr, max amount, etc.)
