# External API Setup Guide

This guide shows how to configure your frontend to use an external collage generation API endpoint.

## 🔧 Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# External Collage Generation API Configuration
NEXT_PUBLIC_COLLAGE_API_URL=https://your-api-endpoint.com/api/collage/generate
NEXT_PUBLIC_ADMIN_TOKEN=YOUR_ADMIN_TOKEN

# Your existing API configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📋 API Request Format

The frontend will send requests in this exact format:

```json
{
  "title": "My Collage",
  "description": "Optional description",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "layout": "grid",
  "width": 1200,
  "height": 800
}
```

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

## 📤 Expected Response Format

Your API should return responses in this format:

```json
{
  "success": true,
  "data": {
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "processedImages": 3,
    "failedImages": 0,
    "failedImageErrors": []
  }
}
```

## 🔐 Authentication

The frontend will automatically include the Bearer token in all requests:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.ADMIN_TOKEN}`
}
```

## ⚡ Features Implemented

✅ **Request Format**: Matches your exact JSON structure  
✅ **Authentication**: Bearer token support  
✅ **Error Handling**: Comprehensive error messages  
✅ **Timeout**: 60-second request timeout  
✅ **TypeScript**: Full type safety  
✅ **Logging**: Detailed console logging  
✅ **Base64 Processing**: Converts response to blob for upload  

## 🧪 Testing the Integration

1. **Update Configuration**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_COLLAGE_API_URL=https://your-actual-api.com/api/collage/generate
   NEXT_PUBLIC_ADMIN_TOKEN=your_actual_token_here
   ```

2. **Test Request**:
   ```javascript
   // The component will automatically send this request
   {
     "title": "ds",
     "description": "we",
     "imageUrls": [
       "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/c396b964-19fc-482c-bd28-198f959584e6.jpg",
       "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/609b580f-c7a5-40dd-bf2c-1ddc2a061e0e.jpg"
     ],
     "layout": "grid",
     "width": 1200,
     "height": 800
   }
   ```

3. **Expected Response**:
   ```json
   {
     "success": true,
     "data": {
       "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
       "processedImages": 2,
       "failedImages": 0,
       "failedImageErrors": []
     }
   }
   ```

## 🚀 Deployment

1. **Set Environment Variables** in your deployment platform:
   - `NEXT_PUBLIC_COLLAGE_API_URL`
   - `NEXT_PUBLIC_ADMIN_TOKEN`

2. **Deploy Your Frontend**:
   ```bash
   npm run build
   npm start
   ```

3. **Test the Integration**:
   - Go to your admin panel
   - Navigate to Photo Wall tab
   - Create a new collage
   - The request will be sent to your external API

## 🔍 Troubleshooting

### Common Issues:

1. **401 Unauthorized**:
   - Check your `NEXT_PUBLIC_ADMIN_TOKEN` is correct
   - Verify the token format: `Bearer YOUR_TOKEN`

2. **404 Not Found**:
   - Verify `NEXT_PUBLIC_COLLAGE_API_URL` is correct
   - Check the API endpoint is accessible

3. **Timeout Errors**:
   - Increase timeout in `apiConfig.ts` if needed
   - Check API response times

4. **CORS Errors**:
   - Ensure your API allows requests from your frontend domain
   - Check CORS configuration on your API server

### Debug Mode:

Enable detailed logging by checking the browser console. The component logs:
- Request data being sent
- Response status and data
- Processing statistics
- Error details

## 📝 Example cURL Test

Test your API endpoint directly:

```bash
curl -X POST https://your-api-endpoint.com/api/collage/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Test Collage",
    "description": "Testing the API",
    "imageUrls": [
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/c396b964-19fc-482c-bd28-198f959584e6.jpg",
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/609b580f-c7a5-40dd-bf2c-1ddc2a061e0e.jpg"
    ],
    "layout": "grid",
    "width": 1200,
    "height": 800
  }'
```

Your frontend is now configured to use your external API endpoint for collage generation! 