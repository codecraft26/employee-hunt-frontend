# API Endpoint Testing Guide

## 🚀 Quick Endpoint Tests

### **Test 1: Users for Reference (Category-Based Polls)**
```bash
curl -X GET "http://localhost:5000/api/users/approved-for-polls" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 18 approved users for poll creation",
  "data": [
    {
      "id": "user1-uuid-123",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "profileImage": "https://s3.../john-profile.jpg",
      "employeeCode": "EMP001",
      "department": "Engineering",
      "categories": [
        {"id": "cat1-uuid", "name": "Developers"},
        {"id": "cat2-uuid", "name": "Team Leads"}
      ]
    }
    // ... more users
  ]
}
```

### **Test 2: Users for Selection (User-Specific Polls)**
```bash
# Test without category filter
curl -X GET "http://localhost:5000/api/votes/available-users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test with category filter
curl -X GET "http://localhost:5000/api/votes/available-users?categoryIds=cat1-uuid,cat2-uuid" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (Same Format):**
```json
{
  "success": true,
  "message": "Found X approved users for voting",
  "data": [
    // Same user structure as above
  ]
}
```

## ❓ Troubleshooting Steps

### **Step 1: Check Endpoint Availability**
Test each endpoint individually:

```bash
# 1. Test category-based endpoint (working)
curl -X GET "http://localhost:5000/api/users/approved-for-polls" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Test user-specific endpoint (might not exist)
curl -X GET "http://localhost:5000/api/votes/available-users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Step 2: Backend Implementation Check**

#### **If `/votes/available-users` doesn't exist, create it:**

**Option A: Create separate endpoint**
```javascript
// GET /api/votes/available-users
async function getAvailableUsersForVoting(req, res) {
  try {
    const { categoryIds } = req.query;
    
    let whereClause = { isApproved: true };
    let include = [{
      model: Category,
      through: { attributes: [] },
      attributes: ['id', 'name']
    }];
    
    // If category filter is provided
    if (categoryIds) {
      const categoryArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      include[0].where = { id: categoryArray };
    }
    
    const users = await User.findAll({
      where: whereClause,
      include: include,
      attributes: ['id', 'name', 'email', 'profileImage', 'employeeCode', 'department'],
      order: [['name', 'ASC']]
    });
    
    return res.json({
      success: true,
      message: `Found ${users.length} approved users for voting`,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available users"
    });
  }
}
```

**Option B: Use existing endpoint (easier)**
Just point `/votes/available-users` to the same controller as `/users/approved-for-polls`:

```javascript
// Route alias
router.get('/votes/available-users', authenticateToken, getApprovedUsersForPolls);
router.get('/users/approved-for-polls', authenticateToken, getApprovedUsersForPolls);
```

### **Step 3: Frontend Debug Console**

When testing, open browser console and look for:

```
🔍 getAvailableUsers: Fetching users with params: undefined
🔍 No category filter, using /users/approved-for-polls
✅ All users fetched: 18
```

OR error messages like:
```
❌ getAvailableUsers failed: {status: 404, message: "Not found", url: "/votes/available-users"}
```

## 🎯 Quick Fix Solutions

### **Solution 1: Backend Route Alias (Recommended)**
Add this to your backend routes:
```javascript
// Quick fix: Make both endpoints point to the same function
router.get('/users/approved-for-polls', authenticateToken, getApprovedUsersForPolls);
router.get('/votes/available-users', authenticateToken, getApprovedUsersForPolls);
```

### **Solution 2: Frontend Fallback (Already Implemented)**
The frontend now automatically falls back to `/users/approved-for-polls` if `/votes/available-users` fails.

### **Solution 3: Test Both Voting Types**

1. **Category-Based Poll Creation:**
   - Select "Category-Based (Custom Options)"
   - Should show user reference panel
   - Check console for: `✅ CreatePollModal: Successfully fetched users: X`

2. **User-Specific Poll Creation:**
   - Select "User-Specific (Manual Selection)"  
   - Should show user search dropdown
   - Check console for: `✅ CreatePollModal: Successfully fetched available users: X`

## 🔍 Debug Checklist

- [ ] Backend endpoint `/users/approved-for-polls` works ✅
- [ ] Backend endpoint `/votes/available-users` exists ❓
- [ ] Admin token is valid and being sent
- [ ] CORS is properly configured
- [ ] API base URL is correct in frontend
- [ ] Console shows proper debug messages

## 📞 Quick Test Commands

```bash
# Test admin login
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "your-password"}'

# Test endpoint with token
curl -X GET "http://localhost:5000/api/users/approved-for-polls" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN"
```

The debugging logs should now show exactly where the issue is! 🔍 