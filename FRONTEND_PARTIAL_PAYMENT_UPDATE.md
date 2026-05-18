# Frontend Partial Payment Update

## Changes Made to GroupDetails.jsx

### 1. Updated Payment Dialog UI

**Changed:** Payment form now includes an editable amount field instead of showing a fixed "Due Amount"

**Before:**
```jsx
<Typography variant="body2" color="text.secondary">Due Amount</Typography>
<Typography variant="h5" fontWeight={800} color="primary.main">
    ETB {Number(expectedContributionAmount || group.rules.defaultContribution || 0).toLocaleString()}
</Typography>
```

**After:**
```jsx
<Typography variant="body2" color="text.secondary">Expected Amount</Typography>
<Typography variant="h6" fontWeight={700} color="text.primary">
    ETB {Number(expectedContributionAmount || group.rules.defaultContribution || 0).toLocaleString()}
</Typography>

<TextField
    label="Payment Amount"
    type="number"
    fullWidth
    value={contributionAmount}
    onChange={(e) => setContributionAmount(e.target.value)}
    InputProps={{
        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>ETB</Typography>,
    }}
    helperText={`Enter amount (0.01 - ${Number(expectedContributionAmount || 0).toLocaleString()} ETB). Partial payments receive proportional winnings.`}
    placeholder={String(expectedContributionAmount || 0)}
    inputProps={{
        min: 0.01,
        max: expectedContributionAmount || 0,
        step: 0.01
    }}
/>
```

### 2. Added Warning for Partial Payments

Shows a warning when user enters less than the expected amount:

```jsx
{contributionAmount && parseFloat(contributionAmount) < (expectedContributionAmount || 0) && (
    <Alert severity="warning">
        You're paying {((parseFloat(contributionAmount) / (expectedContributionAmount || 1)) * 100).toFixed(0)}% of the expected amount. 
        Your winning payout will be proportionally reduced.
    </Alert>
)}
```

### 3. Updated Payment Button

**Before:**
```jsx
<Button
    variant="contained"
    size="large"
    startIcon={<WalletIcon />}
    onClick={handleMakeContribution}
    disabled={isSubmitting}
    fullWidth
>
    {isSubmitting ? <CircularProgress size={22} /> : `Pay ETB ${Number(expectedContributionAmount || group.rules.defaultContribution || 0).toLocaleString()} from Wallet`}
</Button>
```

**After:**
```jsx
<Button
    variant="contained"
    size="large"
    startIcon={<WalletIcon />}
    onClick={handleMakeContribution}
    disabled={isSubmitting || !contributionAmount || parseFloat(contributionAmount) <= 0}
    fullWidth
>
    {isSubmitting ? <CircularProgress size={22} /> : `Pay ETB ${Number(contributionAmount || 0).toLocaleString()} from Wallet`}
</Button>
```

**Changes:**
- Button now shows the entered amount instead of expected amount
- Button is disabled if no amount entered or amount is ≤ 0

### 4. Updated handleMakeContribution Function

**Before:**
```javascript
const handleMakeContribution = async () => {
    const normalizedContributionAmount = !isStoredGroup && expectedContributionAmount > 0
        ? expectedContributionAmount
        : parseFloat(contributionAmount);

    if (!Number.isFinite(normalizedContributionAmount) || normalizedContributionAmount <= 0) {
        enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
        return;
    }

    if (isStoredGroup && normalizedContributionAmount !== Number(group.rules.defaultContribution || 1000)) {
        enqueueSnackbar(`Weekly deposit must be exactly ETB ${group.rules.defaultContribution || 1000}`, { variant: 'warning' });
        return;
    }
    // ... rest of code
};
```

**After:**
```javascript
const handleMakeContribution = async () => {
    const normalizedContributionAmount = parseFloat(contributionAmount);
    const expectedAmount = Number(expectedContributionAmount || group.rules.defaultContribution || 0);

    if (!Number.isFinite(normalizedContributionAmount) || normalizedContributionAmount <= 0) {
        enqueueSnackbar('Please enter a valid amount greater than 0', { variant: 'error' });
        return;
    }

    if (normalizedContributionAmount > expectedAmount) {
        enqueueSnackbar(`Amount cannot exceed ETB ${expectedAmount.toLocaleString()}`, { variant: 'error' });
        return;
    }
    // ... rest of code
};
```

**Changes:**
- Always uses the entered `contributionAmount` value
- Validates amount is > 0
- Validates amount doesn't exceed expected amount
- Removed strict equality check for stored groups

### 5. Updated handleOpenContributionFlow

**Before:**
```javascript
setContributionAmount(String(group?.rules?.defaultContribution || 1000));
```

**After:**
```javascript
setContributionAmount(String(expectedContributionAmount || group?.rules?.defaultContribution || 0));
```

**Changes:**
- Pre-fills the input with the expected contribution amount
- User can edit this value to pay partial amount

---

## User Experience Flow

### Step 1: Open Payment Dialog
- User clicks "Pay Contribution" button
- Dialog opens with expected amount pre-filled in the input field

### Step 2: Enter Amount
- User can keep the pre-filled amount (full payment)
- Or user can change it to any amount between 0.01 and expected amount
- Helper text shows the valid range
- If partial payment, warning shows the percentage and impact

### Step 3: Submit Payment
- Button shows the amount user entered
- Button is disabled if amount is invalid
- On submit, validates amount is within range
- Processes payment with the entered amount

---

## Validation Rules

### Frontend Validation
1. **Amount must be > 0**
   - Error: "Please enter a valid amount greater than 0"

2. **Amount must not exceed expected**
   - Error: "Amount cannot exceed ETB {expected}"

3. **Button disabled when:**
   - No amount entered
   - Amount is ≤ 0
   - Payment is processing

### Backend Validation (Already Implemented)
1. Amount must be > 0
2. Amount must be ≤ expected contribution
3. Sufficient wallet balance

---

## UI Components Added

### TextField for Amount Input
```jsx
<TextField
    label="Payment Amount"
    type="number"
    fullWidth
    value={contributionAmount}
    onChange={(e) => setContributionAmount(e.target.value)}
    InputProps={{
        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>ETB</Typography>,
    }}
    helperText="Enter amount (0.01 - 100 ETB). Partial payments receive proportional winnings."
    placeholder="100"
    inputProps={{
        min: 0.01,
        max: 100,
        step: 0.01
    }}
/>
```

### Warning Alert for Partial Payments
```jsx
<Alert severity="warning">
    You're paying 50% of the expected amount. 
    Your winning payout will be proportionally reduced.
</Alert>
```

---

## Testing Checklist

### Manual Testing
- [ ] Open payment dialog - amount field shows expected amount
- [ ] Change amount to 50 (half) - warning appears
- [ ] Change amount to 25 (quarter) - warning shows 25%
- [ ] Change amount to 100 (full) - no warning
- [ ] Try to enter 0 - button disabled
- [ ] Try to enter negative - validation error
- [ ] Try to enter more than expected - error message
- [ ] Submit with valid partial amount - payment succeeds
- [ ] Check wallet balance updated correctly
- [ ] Check transaction shows correct amount

### Edge Cases
- [ ] Enter 0.01 (minimum) - should work
- [ ] Enter expected amount exactly - should work
- [ ] Enter expected + 1 - should show error
- [ ] Leave field empty - button disabled
- [ ] Enter non-numeric value - handled by input type
- [ ] Enter decimal values (50.50) - should work

---

## Screenshots Description

### Before (Fixed Amount)
```
┌─────────────────────────────────┐
│ Pay Equb Contribution      [X]  │
├─────────────────────────────────┤
│ Group: test eqube               │
│ Due Amount: ETB 100             │
│ Frequency: Weekly               │
│                                 │
│ ℹ️ Payment will be deducted    │
│   from your DigiEqub wallet     │
│                                 │
│ [Cancel] [Pay ETB 100 from...] │
└─────────────────────────────────┘
```

### After (Editable Amount)
```
┌─────────────────────────────────┐
│ Pay Equb Contribution      [X]  │
├─────────────────────────────────┤
│ Group: test eqube               │
│ Expected Amount: ETB 100        │
│ Frequency: Weekly               │
│                                 │
│ Payment Amount                  │
│ ┌─────────────────────────────┐ │
│ │ ETB [50____________]        │ │
│ └─────────────────────────────┘ │
│ Enter amount (0.01 - 100 ETB)   │
│                                 │
│ ⚠️ You're paying 50% of the    │
│   expected amount. Your winning │
│   payout will be proportionally │
│   reduced.                      │
│                                 │
│ ℹ️ Payment will be deducted    │
│   from your DigiEqub wallet     │
│                                 │
│ [Cancel] [Pay ETB 50 from...] │
└─────────────────────────────────┘
```

---

## Next Steps

1. **Restart Frontend Server** to apply changes
2. **Test the payment flow** with different amounts
3. **Verify backend integration** works correctly
4. **Check proportional payout** calculation when winner is selected

---

## How to Restart Frontend

```bash
# Stop the current frontend server (Ctrl+C)
# Then restart:
cd frontend
npm start
# or
yarn start
```

---

## Related Files

- **Frontend:** `frontend/src/pages/GroupDetails.jsx`
- **Backend:** `backend/app/services/wallet_service.py`
- **API:** `backend/app/api/v1/groups.py`
- **Documentation:** 
  - `PROPORTIONAL_PAYOUT_CHANGES.md`
  - `PARTIAL_PAYMENT_API_GUIDE.md`
  - `PROPORTIONAL_PAYOUT_TEST_SCENARIOS.md`
