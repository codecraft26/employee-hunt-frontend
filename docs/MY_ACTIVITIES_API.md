# My Activities API Documentation

## Overview

The `my-activities` endpoint allows users to fetch their own activities from the backend. This endpoint has been integrated into the frontend application with proper error handling, loading states, and TypeScript support.

## Endpoint Details

- **URL**: `${NEXT_PUBLIC_API_URL}/activities/my-activities`
- **Method**: `GET`
- **Authentication**: Required (Bearer token)
- **Response**: JSON object with user's activities

## Frontend Integration

### 1. API Service Method

The endpoint is integrated in `src/services/apiService.ts`:

```typescript
// Added to apiService object
getMyActivities: () => apiService.get('/activities/my-activities')
```

### 2. React Hook

Use the `useActivities` hook to fetch activities in React components:

```typescript
import { useActivities } from '../hooks/useActivities';

const MyComponent = () => {
  const { 
    loading, 
    error, 
    activities, 
    fetchMyActivities 
  } = useActivities();

  useEffect(() => {
    fetchMyActivities();
  }, [fetchMyActivities]);

  // Component render logic...
};
```

### 3. Utility Function

For use outside React components:

```typescript
import { fetchMyActivities } from '../utils/activitiesUtils';

const loadActivities = async () => {
  try {
    const activities = await fetchMyActivities();
    console.log('User activities:', activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
  }
};
```

## Response Format

```typescript
interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeCode?: string | null;
    gender?: string | null;
    profileImage?: string | null;
    department?: string | null;
    hobbies?: string[] | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
}
```

## Usage Examples

### Basic Usage in Component

```typescript
import React, { useEffect } from 'react';
import { useActivities } from '../hooks/useActivities';

const MyActivitiesList = () => {
  const { 
    loading, 
    error, 
    activities, 
    fetchMyActivities,
    clearError 
  } = useActivities();

  useEffect(() => {
    fetchMyActivities();
  }, [fetchMyActivities]);

  const handleRefresh = () => {
    clearError();
    fetchMyActivities();
  };

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {activities.map(activity => (
        <div key={activity.id}>
          <h3>{activity.title}</h3>
          <p>{activity.description}</p>
          <small>{activity.type}</small>
        </div>
      ))}
    </div>
  );
};
```

### Advanced Usage with Utilities

```typescript
import React, { useState, useEffect } from 'react';
import { fetchMyActivities, groupActivitiesByDate, formatActivityType } from '../utils/activitiesUtils';

const AdvancedActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await fetchMyActivities();
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div>
      {Object.entries(groupedActivities).map(([date, dayActivities]) => (
        <div key={date}>
          <h3>{new Date(date).toLocaleDateString()}</h3>
          {dayActivities.map(activity => (
            <div key={activity.id}>
              <h4>{activity.title}</h4>
              <span>{formatActivityType(activity.type)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Connection issues, server down
2. **Authentication Errors**: Invalid or expired tokens
3. **API Errors**: Server-side validation or processing errors
4. **Response Errors**: Malformed response data

```typescript
try {
  const activities = await fetchMyActivities();
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
    redirectToLogin();
  } else if (error.response?.status >= 500) {
    // Handle server error
    showServerErrorMessage();
  } else {
    // Handle other errors
    showGenericErrorMessage(error.message);
  }
}
```

## Environment Configuration

Make sure `NEXT_PUBLIC_API_URL` is set in your environment:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com/api
```

## Updated Components

The following components have been updated to use the new endpoint:

1. **UserActivitiesTab** (`src/components/user/UserActivitiesTab.tsx`)
   - Now uses `fetchMyActivities()` instead of `fetchUserActivities()`
   - Simplified filtering logic since API returns user-specific data
   - Improved error handling

2. **UserOverviewTab** (`src/components/user/UserOverviewTab.tsx`)
   - Updated to use `fetchMyActivities()` instead of `fetchActivities()`
   - Removed client-side filtering logic since API returns user-specific data
   - Maintained optimized data fetching with caching
   - Added debug logging for API calls

3. **useActivities Hook** (`src/hooks/useActivities.ts`)
   - Added `fetchMyActivities()` function
   - Maintains backward compatibility with existing functions
   - Enhanced error handling and logging

## Testing

Test pages have been created to demonstrate the functionality:

1. **Activities Test Page**: `/test-my-activities`
   - Demonstrates the `fetchMyActivities` function
   - Shows API endpoint details and implementation
   - Includes error handling examples

2. **UserOverviewTab Test Page**: `/test-user-overview`
   - Tests the UserOverviewTab component integration
   - Shows activities in the context of the user dashboard
   - Verifies optimized data fetching with caching

Visit these pages in your development environment to test the implementation:
```
http://localhost:3000/test-my-activities
http://localhost:3000/test-user-overview
```

## Migration Guide

If you're updating existing code to use the new endpoint:

### Before:
```typescript
const { fetchUserActivities } = useActivities();
useEffect(() => {
  fetchUserActivities();
}, [fetchUserActivities]);
```

### After:
```typescript
const { fetchMyActivities } = useActivities();
useEffect(() => {
  fetchMyActivities();
}, [fetchMyActivities]);
```

The new implementation provides better performance since:
- No client-side filtering required
- Server returns only relevant data
- Reduced data transfer
- Better caching possibilities
