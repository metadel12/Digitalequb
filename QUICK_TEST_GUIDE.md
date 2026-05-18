# Quick Test Guide - User Approval System

## 🚀 Fastest Way to Test (5 Minutes)

### Step 1: Open Swagger UI
```
http://localhost:8000/docs
```

### Step 2: Login as Admin
1. Find **`POST /api/v1/auth/login`**
2. Click **"Try it out"**
3. Enter:
   ```json
   {
     "username": "metizomawa@gmail.com",
     "password": "Admin@123456"
   }
   ```
4. Click **"Execute"**
5. **Copy the `access_token`** from response

### Step 3: Authorize
1. Click **"Authorize"** button (🔒 top right)
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 4: Check Pending Users
1. Find **`GET /api/v1/admin/users/pending`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. **Look at the response** - you'll see:
   ```json
   {
     "users": [{
       "full_name": "John Doe",
       "profile_completion": {
         "is_complete": true,
         "percentage": 100.0,
         "missing_fields": []
       }
     }]
   }
   ```

### Step 5: Try to Approve
1. Find **`POST /api/v1/admin/users/approve`**
2. Click **"Try it out"**
3. Enter:
   ```json
   {
     "user_id": "COPY_USER_ID_FROM_STEP_4",
     "reason": "Testing approval"
   }
   ```
4. Click **"Execute"**

**Result:**
- ✅ If profile complete → Success!
- ❌ If profile incomplete → Error with missing fields

---

## 📊 What You'll See

### Complete Profile (100%)
```json
{
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
✅ **Can approve normally**

### Incomplete Profile (60%)
```json
{
  "profile_completion": {
    "is_complete": false,
    "percentage": 60.0,
    "completed_fields": 3,
    "total_fields": 5,
    "missing_fields": ["bank_account", "registration_files"],
    "fields_status": {
      "full_name": true,
      "email": true,
      "phone_number": true,
      "bank_account": false,
      "registration_files": false
    }
  }
}
```
❌ **Cannot approve** (must reject or force approve)

---

## 🎯 Quick Tests

### Test 1: Approve Complete Profile
```
1. Find user with 100% completion
2. Click approve
3. ✅ Should succeed
```

### Test 2: Approve Incomplete Profile
```
1. Find user with <100% completion
2. Click approve (without force)
3. ❌ Should fail with error
4. Shows missing fields
```

### Test 3: Force Approve
```
1. Find incomplete user
2. Approve with force=true
3. ✅ Should succeed
4. User marked as "force_approved"
```

### Test 4: Reject User
```
1. Find any pending user
2. Click reject
3. Enter reason
4. ✅ Should succeed
5. User gets notification with missing fields
```

---

## 🔍 Check Results

### In Swagger Response
Look for:
- `"success": true` or `"success": false`
- `"message"` field
- `"profile_completion"` object

### In Database (MongoDB)
```javascript
// Check user status
db.users.findOne({ _id: "user-123" })

// Check approval logs
db.user_approval_logs.find().sort({ created_at: -1 }).limit(5)
```

### In User Notifications
```javascript
db.notifications.find({ 
  user_id: "user-123",
  type: "account_approval"
}).sort({ created_at: -1 })
```

---

## ✅ Success Indicators

### Approval Success
```json
{
  "success": true,
  "message": "User John Doe approved successfully",
  "user": {
    "status": "active",
    "approval_status": "approved",
    "approved_at": "2024-01-15T11:00:00Z"
  }
}
```

### Approval Failure (Incomplete)
```json
{
  "detail": "User profile is incomplete. Missing required fields: bank_account, registration_files",
  "profile_completion": {
    "is_complete": false,
    "missing_fields": ["bank_account", "registration_files"]
  },
  "can_force_approve": true
}
```

### Rejection Success
```json
{
  "success": true,
  "message": "User John Doe rejected",
  "profile_completion": {
    "percentage": 60.0,
    "missing_fields": ["bank_account"]
  }
}
```

---

## 🐛 Common Issues

### "Unauthorized"
- Token expired → Login again
- Missing "Bearer " prefix → Add it
- Wrong token → Copy correct one

### "Admin access required"
- Not logged in as super admin
- Check email: metizomawa@gmail.com
- Check role: super_admin

### No pending users
- Register a new user first
- Check user status is "pending"
- Query: `db.users.find({status: "pending"})`

### Profile shows incomplete
- Check database fields exist
- Verify bank_account structure
- Verify registration_files uploaded

---

## 📱 One-Line Commands

### cURL - Get Pending Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/admin/users/pending
```

### cURL - Approve User
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"user_id":"user-123","reason":"Test"}' http://localhost:8000/api/v1/admin/users/approve
```

### cURL - Force Approve
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"user_id":"user-123","reason":"Test","force":true}' http://localhost:8000/api/v1/admin/users/approve
```

### cURL - Reject User
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"user_id":"user-123","reason":"Incomplete"}' http://localhost:8000/api/v1/admin/users/reject
```

---

## 🎬 Video Tutorial Outline

1. **Open Swagger** (0:00-0:10)
2. **Login as admin** (0:10-0:30)
3. **Authorize with token** (0:30-0:45)
4. **View pending users** (0:45-1:15)
5. **Check profile completion** (1:15-1:45)
6. **Try to approve** (1:45-2:15)
7. **See validation** (2:15-2:45)
8. **Force approve** (2:45-3:15)
9. **Reject user** (3:15-3:45)
10. **Check notifications** (3:45-4:00)

---

## 📋 Checklist

Before testing:
- [ ] Backend running on port 8000
- [ ] MongoDB connected
- [ ] Super admin user exists
- [ ] At least one pending user exists

During testing:
- [ ] Can login as admin
- [ ] Can see pending users
- [ ] Profile completion shows correctly
- [ ] Approve works for complete profiles
- [ ] Approve fails for incomplete profiles
- [ ] Force approve works
- [ ] Reject works
- [ ] Notifications sent

After testing:
- [ ] Check user status changed
- [ ] Check approval logs created
- [ ] Check notifications sent
- [ ] Verify database updated

---

## 🎯 Expected Timeline

- **Setup:** 1 minute
- **Login:** 30 seconds
- **Check users:** 1 minute
- **Test approve:** 1 minute
- **Test reject:** 1 minute
- **Verify:** 30 seconds

**Total:** ~5 minutes

---

## 💡 Pro Tips

1. **Keep Swagger open** - Easiest way to test
2. **Copy user IDs** - From pending users response
3. **Check percentage** - Quick way to see completion
4. **Use force wisely** - Only for special cases
5. **Read error messages** - They tell you what's missing
6. **Check notifications** - Users get informed
7. **View logs** - Track all approval actions

---

## 🆘 Need Help?

**Can't login?**
→ Check admin credentials in auth_service.py

**No pending users?**
→ Register a new user first

**Approval not working?**
→ Check backend logs for errors

**Profile shows wrong data?**
→ Check database user document

**Token expired?**
→ Login again to get new token

---

## 🎉 Success!

If you can:
1. ✅ See pending users with completion status
2. ✅ Approve complete profiles
3. ✅ Block incomplete profiles
4. ✅ Force approve when needed
5. ✅ Reject with reasons

**The system is working perfectly!** 🚀
