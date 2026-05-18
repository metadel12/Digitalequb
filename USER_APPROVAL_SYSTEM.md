# User Approval System with Profile Completion Validation

## Overview
The system now validates that new users have completed all required registration fields before the super admin can approve them. Incomplete profiles can be rejected with specific reasons, or force-approved if necessary.

---

## Required Registration Fields

New users must complete the following fields to be approved:

1. **full_name** - User's full name
2. **email** - Valid email address
3. **phone_number** - Valid phone number
4. **bank_account** - Commercial Bank of Ethiopia account details:
   - `account_number`
   - `account_name`
5. **registration_files** - Required documents:
   - `property_file` - Property ownership document
   - `wealth_files` - At least one wealth verification document

---

## User Registration Flow

### 1. User Registers
```
POST /api/v1/auth/register
```

**Required Data:**
- Full name
- Email
- Phone number
- Password
- Bank account (CBE account number and name)
- Property file (PDF/image)
- Wealth files (at least one document)

**Result:**
- User created with status: `pending`
- User cannot login until approved
- Admin receives notification of new registration

### 2. Admin Reviews Pending Users
```
GET /api/v1/admin/users/pending
```

**Response includes:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-123",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+251911234567",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "profile_completion": {
        "is_complete": false,
        "percentage": 80.0,
        "completed_fields": 4,
        "total_fields": 5,
        "missing_fields": ["registration_files"],
        "fields_status": {
          "full_name": true,
          "email": true,
          "phone_number": true,
          "bank_account": true,
          "registration_files": false
        }
      }
    }
  ],
  "total": 10,
  "limit": 50,
  "skip": 0
}
```

### 3. Admin Checks Specific User Profile
```
GET /api/v1/admin/users/{user_id}/profile-completion
```

**Response:**
```json
{
  "success": true,
  "user_id": "user-123",
  "profile_completion": {
    "is_complete": true,
    "percentage": 100.0,
    "completed_fields": 5,
    "total_fields": 5,
    "missing_fields": [],
    "fields_status": {
      "full_name": true,
      "email": true,
      "phone_number": true,
      "bank_account": true,
      "registration_files": true
    }
  }
}
```

### 4. Admin Approves User (Profile Complete)
```
POST /api/v1/admin/users/approve
{
  "user_id": "user-123",
  "reason": "All documents verified"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User John Doe approved successfully",
  "user": {
    "id": "user-123",
    "status": "active",
    "approval_status": "approved",
    "approved_by": "admin-456",
    "approved_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Response (Incomplete Profile):**
```json
{
  "detail": "User profile is incomplete. Missing required fields: registration_files, bank_account",
  "profile_completion": {
    "is_complete": false,
    "percentage": 60.0,
    "completed_fields": 3,
    "total_fields": 5,
    "missing_fields": ["registration_files", "bank_account"],
    "fields_status": {
      "full_name": true,
      "email": true,
      "phone_number": true,
      "bank_account": false,
      "registration_files": false
    }
  },
  "can_force_approve": true
}
```

### 5. Admin Force Approves (Override Validation)
```
POST /api/v1/admin/users/approve
{
  "user_id": "user-123",
  "reason": "Approved pending document submission",
  "force": true
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User John Doe approved successfully",
  "user": {
    "id": "user-123",
    "status": "active",
    "approval_status": "approved",
    "force_approved": true,
    "approved_by": "admin-456",
    "approved_at": "2024-01-15T11:00:00Z"
  }
}
```

### 6. Admin Rejects User
```
POST /api/v1/admin/users/reject
{
  "user_id": "user-123",
  "reason": "Invalid bank account information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User John Doe rejected",
  "profile_completion": {
    "is_complete": false,
    "percentage": 80.0,
    "completed_fields": 4,
    "total_fields": 5,
    "missing_fields": ["bank_account"],
    "fields_status": {
      "full_name": true,
      "email": true,
      "phone_number": true,
      "bank_account": false,
      "registration_files": true
    }
  },
  "user": {
    "id": "user-123",
    "status": "rejected",
    "approval_status": "rejected",
    "rejected_by": "admin-456",
    "rejected_at": "2024-01-15T11:00:00Z",
    "rejection_reason": "Invalid bank account information"
  }
}
```

---

## User Notifications

### Approval Notification
**Title:** "Account Approved"
**Message:** "Your DigiEqub account has been approved. You can now join groups and start saving."

### Rejection Notification
**Title:** "Registration Rejected"
**Message:** "Your registration was rejected. Reason: {reason}. Missing required fields: {missing_fields}."

---

## Admin Action Logs

All approval/rejection actions are logged:

```json
{
  "_id": "log-123",
  "user_id": "user-123",
  "user_name": "John Doe",
  "action": "approved",  // or "rejected", "force_approved"
  "admin_id": "admin-456",
  "reason": "All documents verified",
  "created_at": "2024-01-15T11:00:00Z"
}
```

View logs:
```
GET /api/v1/admin/users/logs
```

---

## Profile Completion Calculation

### Formula
```
percentage = (completed_fields / total_fields) × 100
```

### Field Validation Rules

1. **full_name**: Must not be empty
2. **email**: Must not be empty
3. **phone_number**: Must not be empty
4. **bank_account**: Must have both:
   - `account_number` (not empty)
   - `account_name` (not empty)
5. **registration_files**: Must have both:
   - `property_file` (uploaded)
   - `wealth_files` (at least one uploaded)

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users/pending` | List pending users with completion status |
| GET | `/api/v1/admin/users/{user_id}/profile-completion` | Check specific user's profile completion |
| POST | `/api/v1/admin/users/approve` | Approve user (validates completion) |
| POST | `/api/v1/admin/users/reject` | Reject user with reason |
| GET | `/api/v1/admin/users/logs` | View approval/rejection logs |

---

## Use Cases

### Use Case 1: Complete Profile - Approve
1. User registers with all required fields
2. Admin reviews pending users
3. Profile shows 100% complete
4. Admin approves without force flag
5. User receives approval notification
6. User can now login and use the system

### Use Case 2: Incomplete Profile - Reject
1. User registers but misses bank account
2. Admin reviews pending users
3. Profile shows 80% complete, missing bank_account
4. Admin rejects with reason "Please provide valid bank account"
5. User receives rejection notification with missing fields
6. User cannot login

### Use Case 3: Incomplete Profile - Force Approve
1. User registers but property file is pending
2. Admin reviews pending users
3. Profile shows 80% complete, missing registration_files
4. Admin decides to approve pending document submission
5. Admin uses force=true flag
6. User is approved despite incomplete profile
7. System marks as "force_approved"
8. User can login

### Use Case 4: Check Profile Before Decision
1. Admin sees pending user
2. Admin calls profile-completion endpoint
3. Reviews detailed field status
4. Downloads registration files if needed
5. Makes informed approval/rejection decision

---

## Database Schema Changes

### User Document Updates

**New Fields:**
```javascript
{
  // Approval fields
  "approval_status": "pending|approved|rejected",
  "approved_by": "admin-user-id",
  "approved_at": ISODate("2024-01-15T11:00:00Z"),
  "force_approved": false,
  
  // Rejection fields
  "rejected_by": "admin-user-id",
  "rejected_at": ISODate("2024-01-15T11:00:00Z"),
  "rejection_reason": "Invalid documents",
  "profile_completion_at_rejection": {
    "is_complete": false,
    "percentage": 60.0,
    "missing_fields": ["bank_account"]
  }
}
```

---

## Testing Scenarios

### Test 1: Approve Complete Profile
```bash
# Register user with all fields
POST /api/v1/auth/register
{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone_number": "+251911111111",
  "password": "Test@123",
  "bank_account": {
    "account_number": "1000123456789",
    "account_name": "Test User"
  },
  # Include property_file and wealth_files
}

# Admin approves
POST /api/v1/admin/users/approve
{
  "user_id": "user-123"
}

# Expected: Success
```

### Test 2: Reject Incomplete Profile
```bash
# User missing bank account
# Admin tries to approve
POST /api/v1/admin/users/approve
{
  "user_id": "user-123"
}

# Expected: Error with missing fields
# Admin rejects
POST /api/v1/admin/users/reject
{
  "user_id": "user-123",
  "reason": "Missing bank account information"
}

# Expected: Success with profile completion details
```

### Test 3: Force Approve
```bash
# User missing registration files
# Admin force approves
POST /api/v1/admin/users/approve
{
  "user_id": "user-123",
  "reason": "Approved pending document upload",
  "force": true
}

# Expected: Success, user marked as force_approved
```

---

## Security Considerations

1. **Admin Only**: All approval endpoints require super_admin role
2. **Audit Trail**: All actions are logged with admin ID and timestamp
3. **Force Approval**: Tracked separately for compliance
4. **User Notification**: Users are always notified of approval/rejection
5. **Profile Validation**: Cannot be bypassed without explicit force flag

---

## Frontend Integration

### Display Pending Users with Completion Status

```javascript
// Fetch pending users
const response = await fetch('/api/v1/admin/users/pending');
const data = await response.json();

// Display each user
data.users.forEach(user => {
  const completion = user.profile_completion;
  
  console.log(`User: ${user.full_name}`);
  console.log(`Completion: ${completion.percentage}%`);
  console.log(`Missing: ${completion.missing_fields.join(', ')}`);
  
  // Show approve button only if complete
  if (completion.is_complete) {
    showApproveButton(user.id);
  } else {
    showRejectButton(user.id);
    showForceApproveButton(user.id);
  }
});
```

### Approve User

```javascript
async function approveUser(userId, force = false) {
  try {
    const response = await fetch('/api/v1/admin/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        reason: 'All requirements met',
        force: force
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`User approved successfully!`);
    } else {
      // Show missing fields
      if (data.profile_completion) {
        const missing = data.profile_completion.missing_fields.join(', ');
        alert(`Cannot approve: Missing ${missing}`);
        
        // Offer force approve option
        if (confirm('Force approve anyway?')) {
          approveUser(userId, true);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Reject User

```javascript
async function rejectUser(userId, reason) {
  const response = await fetch('/api/v1/admin/users/reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      reason: reason
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    alert(`User rejected. Missing fields: ${data.profile_completion.missing_fields.join(', ')}`);
  }
}
```

---

## Benefits

1. **Quality Control**: Ensures only complete profiles are approved
2. **Transparency**: Clear visibility of what's missing
3. **Flexibility**: Force approve option for special cases
4. **User Feedback**: Users know exactly what's missing
5. **Audit Trail**: Complete log of all approval decisions
6. **Compliance**: Documented approval process

---

## Next Steps

1. **Restart Backend** to apply changes
2. **Test approval flow** with complete/incomplete profiles
3. **Update frontend** to show completion status
4. **Train admins** on new approval process
5. **Monitor logs** for approval patterns
