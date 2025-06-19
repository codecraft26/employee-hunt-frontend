# Required Backend Endpoint for User Reference

## 🎯 Endpoint Specification

### **GET /api/users/approved-for-polls**

**Purpose:** Fetch all approved users for admin reference when creating category-based polls

**Access:** Admin only (requires valid admin JWT token)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Query Parameters:** None

**Response Format:**
```json
{
  "success": true,
  "message": "Found 18 approved users for poll creation",
  "data": [
    {
      "id": "user1-uuid",
      "name": "John Doe",
      "email": "john@company.com", 
      "profileImage": "https://s3.../profile1.jpg",
      "employeeCode": "EMP001",
      "department": "Engineering",
      "categories": [
        {
          "id": "cat1-uuid",
          "name": "Developers"
        },
        {
          "id": "cat2-uuid", 
          "name": "Team Leads"
        }
      ]
    }
    // ... more users
  ]
}
```

**Error Responses:**
```json
// Unauthorized
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}

// Server Error
{
  "success": false,
  "message": "Failed to fetch users"
}
```

## 🔧 Implementation Notes

### **Database Query (Example):**
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.profile_image,
  u.employee_code,
  u.department,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', c.id,
      'name', c.name
    )
  ) as categories
FROM users u
LEFT JOIN user_categories uc ON u.id = uc.user_id
LEFT JOIN categories c ON uc.category_id = c.id
WHERE u.is_approved = true
GROUP BY u.id, u.name, u.email, u.profile_image, u.employee_code, u.department
ORDER BY u.name;
```

### **Controller Logic (Example):**
```javascript
// GET /api/users/approved-for-polls
async function getApprovedUsersForPolls(req, res) {
  try {
    // Verify admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // Fetch approved users with categories
    const users = await User.findAll({
      where: { isApproved: true },
      include: [
        {
          model: Category,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'profileImage', 
        'employeeCode', 'department'
      ],
      order: [['name', 'ASC']]
    });

    return res.json({
      success: true,
      message: `Found ${users.length} approved users for poll creation`,
      data: users
    });

  } catch (error) {
    console.error('Error fetching approved users:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
}
```

## 🚀 Quick Setup

1. **Add the route:**
   ```javascript
   router.get('/users/approved-for-polls', authenticateToken, getApprovedUsersForPolls);
   ```

2. **Test the endpoint:**
   ```bash
   curl -X GET "http://localhost:5000/api/users/approved-for-polls" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Verify response structure matches the specification above** 