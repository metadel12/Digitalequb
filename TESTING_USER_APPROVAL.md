# How to Check and Test User Approval System

## Quick Test Guide

### Step 1: Check if Backend is Running

```bash
# Open browser and go to:
http://localhost:8000/docs

# Or check API health:
http://localhost:8000/api/health
```

---

## Method 1: Using Swagger UI (Easiest)

### 1. Open Swagger Documentation
```
http://localhost:8000/docs
```

### 2. Login as Super Admin

**Find the `/api/v1/auth/login` endpoint**

Click "Try it out" and enter:
```json
{
  "username": "metizomawa@gmail.com",
  "password": "Admin@123456"
}
```

Click "Execute"

**Copy the `access_token` from the response**

### 3. Authorize Swagger

1. Click the **"Authorize"** button at the top right
2. Paste the token in the format: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Click "Close"

### 4. Check Pending Users

**Find `/api/v1/admin/users/pending`**

Click "Try it out" → "Execute"

**Expected Response:**
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
  ],
  "total": 1
}
```

### 5. Check Specific User Profile

**Find `/api/v1/admin/users/{user_id}/profile-completion`**

1. Click "Try it out"
2. Enter user_id (e.g., "user-123")
3. Click "Execute"

**Expected Response:**
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

### 6. Try to Approve User

**Find `/api/v1/admin/users/approve`**

Click "Try it out" and enter:
```json
{
  "user_id": "user-123",
  "reason": "All documents verified"
}
```

Click "Execute"

**If profile is complete:**
```json
{
  "success": true,
  "message": "User John Doe approved successfully"
}
```

**If profile is incomplete:**
```json
{
  "detail": "User profile is incomplete. Missing required fields: bank_account, registration_files"
}
```

### 7. Force Approve (if needed)

```json
{
  "user_id": "user-123",
  "reason": "Approved pending document submission",
  "force": true
}
```

### 8. Reject User

**Find `/api/v1/admin/users/reject`**

```json
{
  "user_id": "user-123",
  "reason": "Invalid bank account information"
}
```

---

## Method 2: Using Postman

### Setup

1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:8000/api/v1/auth/login`

2. **Login**
   ```json
   {
     "username": "metizomawa@gmail.com",
     "password": "Admin@123456"
   }
   ```

3. **Copy Access Token**

4. **Set Authorization Header**
   - Key: `Authorization`
   - Value: `Bearer YOUR_ACCESS_TOKEN`

### Test Endpoints

#### Get Pending Users
```
GET http://localhost:8000/api/v1/admin/users/pending
Headers:
  Authorization: Bearer YOUR_TOKEN
```

#### Check Profile Completion
```
GET http://localhost:8000/api/v1/admin/users/USER_ID/profile-completion
Headers:
  Authorization: Bearer YOUR_TOKEN
```

#### Approve User
```
POST http://localhost:8000/api/v1/admin/users/approve
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "user_id": "user-123",
  "reason": "All requirements met"
}
```

#### Reject User
```
POST http://localhost:8000/api/v1/admin/users/reject
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "user_id": "user-123",
  "reason": "Missing documents"
}
```

---

## Method 3: Using cURL (Command Line)

### 1. Login and Get Token
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "metizomawa@gmail.com",
    "password": "Admin@123456"
  }'
```

**Copy the access_token from response**

### 2. Get Pending Users
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Check Profile Completion
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/USER_ID/profile-completion" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Approve User
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/approve" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "reason": "All documents verified"
  }'
```

### 5. Force Approve
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/approve" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "reason": "Approved pending documents",
    "force": true
  }'
```

### 6. Reject User
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/reject" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "reason": "Invalid bank account"
  }'
```

---

## Method 4: Using Python Script

Create a file `test_approval.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# 1. Login as admin
def login():
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "username": "metizomawa@gmail.com",
        "password": "Admin@123456"
    })
    data = response.json()
    return data.get("access_token")

# 2. Get pending users
def get_pending_users(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/admin/users/pending", headers=headers)
    return response.json()

# 3. Check profile completion
def check_profile(token, user_id):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/v1/admin/users/{user_id}/profile-completion",
        headers=headers
    )
    return response.json()

# 4. Approve user
def approve_user(token, user_id, force=False):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/api/v1/admin/users/approve",
        headers=headers,
        json={
            "user_id": user_id,
            "reason": "All requirements met",
            "force": force
        }
    )
    return response.json()

# 5. Reject user
def reject_user(token, user_id, reason):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/api/v1/admin/users/reject",
        headers=headers,
        json={
            "user_id": user_id,
            "reason": reason
        }
    )
    return response.json()

# Run tests
if __name__ == "__main__":
    print("1. Logging in...")
    token = login()
    print(f"✓ Token: {token[:20]}...")
    
    print("\n2. Getting pending users...")
    pending = get_pending_users(token)
    print(f"✓ Found {pending.get('total', 0)} pending users")
    
    if pending.get('users'):
        user = pending['users'][0]
        user_id = user['id']
        
        print(f"\n3. Checking profile for {user['full_name']}...")
        profile = check_profile(token, user_id)
        completion = profile['profile_completion']
        print(f"✓ Profile completion: {completion['percentage']}%")
        print(f"  Complete: {completion['is_complete']}")
        print(f"  Missing: {completion['missing_fields']}")
        
        if completion['is_complete']:
            print(f"\n4. Approving user...")
            result = approve_user(token, user_id)
            print(f"✓ {result.get('message', 'Done')}")
        else:
            print(f"\n4. Profile incomplete, trying to approve...")
            result = approve_user(token, user_id)
            if not result.get('success'):
                print(f"✗ Cannot approve: {result.get('detail', 'Error')}")
                print(f"\n5. Force approving...")
                result = approve_user(token, user_id, force=True)
                print(f"✓ {result.get('message', 'Done')}")
```

Run it:
```bash
python test_approval.py
```

---

## Method 5: Check Database Directly

### Using MongoDB Compass or Shell

```javascript
// Connect to MongoDB
use digitequb

// 1. Find pending users
db.users.find({
  status: "pending"
}).pretty()

// 2. Check specific user
db.users.findOne({
  _id: "user-123"
})

// 3. Check if user has all required fields
db.users.aggregate([
  { $match: { status: "pending" } },
  {
    $project: {
      full_name: 1,
      email: 1,
      phone_number: 1,
      has_bank_account: { 
        $and: [
          { $ne: ["$bank_account.account_number", null] },
          { $ne: ["$bank_account.account_name", null] }
        ]
      },
      has_registration_files: {
        $and: [
          { $ne: ["$registration_files.property_file", null] },
          { $gt: [{ $size: { $ifNull: ["$registration_files.wealth_files", []] } }, 0] }
        ]
      }
    }
  }
])

// 4. Check approval logs
db.user_approval_logs.find().sort({ created_at: -1 }).limit(10)
```

---

## Testing Scenarios

### Scenario 1: Complete Profile
```
1. Register user with ALL fields
2. Login as admin
3. GET /admin/users/pending
4. Verify profile_completion.is_complete = true
5. POST /admin/users/approve (without force)
6. Verify success = true
7. Check user status = "active"
```

### Scenario 2: Incomplete Profile
```
1. Create user missing bank_account in database
2. Login as admin
3. GET /admin/users/pending
4. Verify profile_completion.is_complete = false
5. Verify missing_fields includes "bank_account"
6. POST /admin/users/approve (without force)
7. Verify error message about missing fields
8. POST /admin/users/reject with reason
9. Verify success = true
```

### Scenario 3: Force Approve
```
1. User with incomplete profile
2. Login as admin
3. POST /admin/users/approve with force=true
4. Verify success = true
5. Check user.force_approved = true
6. Check user status = "active"
```

---

## Expected Results

### ✅ Complete Profile (100%)
```json
{
  "is_complete": true,
  "percentage": 100.0,
  "missing_fields": []
}
```
**Action:** Can approve normally

### ⚠️ Incomplete Profile (80%)
```json
{
  "is_complete": false,
  "percentage": 80.0,
  "missing_fields": ["registration_files"]
}
```
**Action:** Must reject or force approve

### ❌ Very Incomplete (40%)
```json
{
  "is_complete": false,
  "percentage": 40.0,
  "missing_fields": ["bank_account", "registration_files", "phone_number"]
}
```
**Action:** Should reject

---

## Troubleshooting

### Issue 1: "Unauthorized" Error
**Solution:** 
- Check if token is valid
- Re-login to get new token
- Ensure "Bearer " prefix in Authorization header

### Issue 2: "Admin access required"
**Solution:**
- Verify user role is "super_admin"
- Check email matches SYSTEM_ADMIN_EMAIL

### Issue 3: No pending users
**Solution:**
- Register a new user
- Check database: `db.users.find({status: "pending"})`
- Verify user status is "pending" not "active"

### Issue 4: Profile shows incomplete but all fields exist
**Solution:**
- Check exact field structure in database
- Verify bank_account has both account_number AND account_name
- Verify registration_files has property_file AND wealth_files array

---

## Quick Verification Checklist

- [ ] Backend server is running (http://localhost:8000)
- [ ] Can access Swagger UI (http://localhost:8000/docs)
- [ ] Can login as super admin
- [ ] Can see pending users endpoint
- [ ] Pending users show profile_completion field
- [ ] Can check individual user profile completion
- [ ] Approve works for complete profiles
- [ ] Approve fails for incomplete profiles
- [ ] Force approve works
- [ ] Reject works and includes missing fields
- [ ] User receives notification after approval/rejection

---

## Video Tutorial Steps

1. **Open browser** → http://localhost:8000/docs
2. **Find login endpoint** → /api/v1/auth/login
3. **Click "Try it out"**
4. **Enter admin credentials**
5. **Click "Execute"**
6. **Copy access_token**
7. **Click "Authorize" button** (top right)
8. **Paste token** with "Bearer " prefix
9. **Find pending users endpoint** → /api/v1/admin/users/pending
10. **Click "Try it out"** → **"Execute"**
11. **See profile completion** for each user
12. **Try approving** complete/incomplete profiles
13. **See the difference!**

---

## Need Help?

If something doesn't work:
1. Check backend logs for errors
2. Verify database connection
3. Ensure all migrations ran
4. Check if super admin user exists
5. Verify token is not expired
