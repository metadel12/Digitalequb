# Proportional Payout Test Scenarios

## Test Scenario 1: All Members Pay Full Amount
**Setup:**
- Group: 5 members
- Expected contribution: 100 Birr per member
- All members pay: 100 Birr each

**Payments:**
- Member A: 100 Birr ✓
- Member B: 100 Birr ✓
- Member C: 100 Birr ✓
- Member D: 100 Birr ✓
- Member E: 100 Birr ✓

**Winner: Member A**

**Expected Results:**
- Total collected: 500 Birr
- Winner contribution %: 100%
- Winner payout: (500 × 0.90) × 1.0 = **450 Birr**
- System fee: 500 × 0.10 = **50 Birr**

---

## Test Scenario 2: Winner Pays Half
**Setup:**
- Group: 5 members
- Expected contribution: 100 Birr per member
- Winner pays half, others pay full

**Payments:**
- Member A: 50 Birr ✓ (50%)
- Member B: 100 Birr ✓
- Member C: 100 Birr ✓
- Member D: 100 Birr ✓
- Member E: 100 Birr ✓

**Winner: Member A**

**Expected Results:**
- Total collected: 450 Birr
- Winner contribution %: 50%
- Winner payout: (450 × 0.90) × 0.5 = **202.5 Birr**
- System fee: 450 × 0.10 = **45 Birr**

**Verification:**
- Winner gets 4.05x their contribution (202.5 / 50 = 4.05)
- If they paid full 100, they would get 405 Birr
- Fair proportional reduction ✓

---

## Test Scenario 3: Winner Pays Quarter
**Setup:**
- Group: 4 members
- Expected contribution: 200 Birr per member
- Winner pays 25%, others pay full

**Payments:**
- Member A: 50 Birr ✓ (25%)
- Member B: 200 Birr ✓
- Member C: 200 Birr ✓
- Member D: 200 Birr ✓

**Winner: Member A**

**Expected Results:**
- Total collected: 650 Birr
- Winner contribution %: 25%
- Winner payout: (650 × 0.90) × 0.25 = **146.25 Birr**
- System fee: 650 × 0.10 = **65 Birr**

**Verification:**
- Winner gets 2.925x their contribution (146.25 / 50 = 2.925)
- If they paid full 200, they would get 585 Birr
- Fair proportional reduction ✓

---

## Test Scenario 4: Mixed Partial Payments
**Setup:**
- Group: 6 members
- Expected contribution: 100 Birr per member
- Various payment amounts

**Payments:**
- Member A: 100 Birr ✓ (100%)
- Member B: 75 Birr ✓ (75%)
- Member C: 50 Birr ✓ (50%)
- Member D: 100 Birr ✓ (100%)
- Member E: 80 Birr ✓ (80%)
- Member F: 100 Birr ✓ (100%)

**Winner: Member C (paid 50%)**

**Expected Results:**
- Total collected: 505 Birr
- Winner contribution %: 50%
- Winner payout: (505 × 0.90) × 0.5 = **227.25 Birr**
- System fee: 505 × 0.10 = **50.5 Birr**

---

## Test Scenario 5: Minimum Payment
**Setup:**
- Group: 3 members
- Expected contribution: 1,000 Birr per member
- Winner pays minimum

**Payments:**
- Member A: 10 Birr ✓ (1%)
- Member B: 1,000 Birr ✓
- Member C: 1,000 Birr ✓

**Winner: Member A**

**Expected Results:**
- Total collected: 2,010 Birr
- Winner contribution %: 1%
- Winner payout: (2,010 × 0.90) × 0.01 = **18.09 Birr**
- System fee: 2,010 × 0.10 = **201 Birr**

**Verification:**
- Winner gets 1.809x their contribution (18.09 / 10 = 1.809)
- Still profitable but minimal return
- Incentivizes full payment ✓

---

## Test Scenario 6: Large Group with Varied Payments
**Setup:**
- Group: 10 members
- Expected contribution: 500 Birr per member
- Varied payment amounts

**Payments:**
- Member A: 500 Birr ✓ (100%)
- Member B: 500 Birr ✓ (100%)
- Member C: 250 Birr ✓ (50%)
- Member D: 500 Birr ✓ (100%)
- Member E: 400 Birr ✓ (80%)
- Member F: 500 Birr ✓ (100%)
- Member G: 300 Birr ✓ (60%)
- Member H: 500 Birr ✓ (100%)
- Member I: 500 Birr ✓ (100%)
- Member J: 150 Birr ✓ (30%)

**Winner: Member G (paid 60%)**

**Expected Results:**
- Total collected: 4,100 Birr
- Winner contribution %: 60%
- Winner payout: (4,100 × 0.90) × 0.6 = **2,214 Birr**
- System fee: 4,100 × 0.10 = **410 Birr**

**Verification:**
- Winner gets 7.38x their contribution (2,214 / 300 = 7.38)
- If they paid full 500, they would get 3,690 Birr
- Proportional reduction: 60% payment = 60% of full payout ✓

---

## Edge Cases to Test

### Edge Case 1: All Members Pay Different Amounts
- Verify total collected is sum of actual payments
- Verify winner payout is proportional to their specific contribution
- Verify system always gets 10% of total

### Edge Case 2: Winner Pays Maximum (Expected Amount)
- Should receive full 90% share of their proportional contribution
- Same as old system for full payers

### Edge Case 3: Very Small Payment (1 Birr)
- System should handle decimal calculations correctly
- Winner should still receive proportional amount

### Edge Case 4: Round Number Tracking
- Verify `round_contributions` field is populated correctly
- Verify different rounds track independently
- Member pays 50 Birr in round 1, 100 Birr in round 2

### Edge Case 5: Missing `round_contributions` Field
- System should default to expected contribution amount
- Backward compatibility with existing members

---

## API Testing Checklist

### Payment Submission
- [ ] Submit full payment (100 Birr of 100 expected)
- [ ] Submit half payment (50 Birr of 100 expected)
- [ ] Submit quarter payment (25 Birr of 100 expected)
- [ ] Submit 1 Birr payment
- [ ] Try to submit 0 Birr (should fail)
- [ ] Try to submit more than expected (should fail)
- [ ] Try to submit negative amount (should fail)

### Winner Selection
- [ ] Select winner who paid full amount
- [ ] Select winner who paid 50%
- [ ] Select winner who paid 25%
- [ ] Verify winner_amount calculation
- [ ] Verify system_fee calculation
- [ ] Verify winner_contribution_percentage in response

### Payment Verification (Admin)
- [ ] Verify partial payment
- [ ] Check `round_contributions` field is updated
- [ ] Verify total_contributed is incremented correctly

### Notifications
- [ ] Winner receives correct payout amount in SMS
- [ ] Winner receives correct payout amount in email
- [ ] Email explains proportional calculation
- [ ] Other members notified of winner

---

## Database Verification Queries

### Check Member Round Contributions
```javascript
db.groups.findOne(
  {"_id": "group-id"},
  {"members.round_contributions": 1, "members.user_id": 1}
)
```

### Check Winner Records
```javascript
db.winner_records.find({
  "group_id": "group-id"
}).sort({"round_number": -1})
```

### Verify System Wallet Transactions
```javascript
db.system_wallet_transactions.find({
  "group_id": "group-id"
}).sort({"created_at": -1})
```

---

## Expected Behavior Summary

1. **Partial payments are accepted** (> 0 and ≤ expected amount)
2. **Winner payout is proportional** to their contribution percentage
3. **System fee is always 10%** of total collected
4. **Round contributions are tracked** per member per round
5. **Notifications reflect** actual payout amounts
6. **Backward compatible** with existing members
