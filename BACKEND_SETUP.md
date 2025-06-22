# Backend Collage Generator Setup

This is a standalone Node.js backend service for generating photo collages using Sharp image processing.

## 🚀 Quick Start

### 1. Setup Backend Directory
```bash
# Create a new directory for the backend
mkdir collage-generator-backend
cd collage-generator-backend

# Copy the backend files
cp backend-collage-generator.js .
cp backend-package.json package.json
cp test-collage-backend.js .
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📋 API Endpoints

### POST `/api/collage/generate`
Generates a collage from provided images.

**Request Body:**
```json
{
  "title": "My Collage",
  "description": "A beautiful collection of photos",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "layout": "grid",
  "width": 1200,
  "height": 800
}
```

**Response:**
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

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Collage generator service is running"
}
```

## 🧪 Testing

Run the test script to verify everything works:

```bash
node test-collage-backend.js
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)

### Request Limits
- Maximum 10 images per collage
- 10-second timeout per image fetch
- 50MB request size limit

## 📦 Deployment

### Option 1: Local/Server Deployment
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start backend-collage-generator.js --name "collage-generator"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY backend-collage-generator.js ./

EXPOSE 5000

CMD ["node", "backend-collage-generator.js"]
```

Build and run:
```bash
docker build -t collage-generator .
docker run -p 5000:5000 collage-generator
```

### Option 3: Cloud Deployment
- **Heroku**: Add `Procfile` with `web: node backend-collage-generator.js`
- **Railway**: Connect GitHub repo and deploy
- **Render**: Create web service from GitHub repo
- **DigitalOcean App Platform**: Deploy from GitHub

## 🔗 Frontend Integration

Update your frontend to call the backend API:

```javascript
// Replace the server action call with API call
const generateCollageImage = async () => {
  try {
    const response = await fetch('http://your-backend-url:5000/api/collage/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: collageTitle,
        description: collageDescription,
        imageUrls: selectedPhotos.map(photo => photo.imageUrl),
        layout: 'grid',
        width: 1200,
        height: 800
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Convert base64 to blob and upload
      const base64Data = result.data.imageUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Upload to your storage
      await uploadCollageImage(collageId, blob);
    }
  } catch (error) {
    console.error('Failed to generate collage:', error);
  }
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **Sharp Installation Issues**
   ```bash
   # On Ubuntu/Debian
   sudo apt-get update && sudo apt-get install -y libvips-dev
   
   # On macOS
   brew install vips
   
   # Reinstall sharp
   npm rebuild sharp
   ```

2. **Memory Issues**
   - Reduce image quality: `jpeg({ quality: 80 })`
   - Reduce canvas size: `width: 800, height: 600`
   - Process fewer images at once

3. **Timeout Issues**
   - Increase timeout in axios config
   - Check network connectivity
   - Verify image URLs are accessible

4. **CORS Issues**
   - Ensure CORS is properly configured
   - Add your frontend domain to allowed origins

## 📝 Example Usage

### cURL Example
```bash
curl -X POST http://localhost:5000/api/collage/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Collage",
    "description": "Testing the API",
    "imageUrls": [
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/c396b964-19fc-482c-bd28-198f959584e6.jpg",
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/609b580f-c7a5-40dd-bf2c-1ddc2a061e0e.jpg"
    ],
    "width": 1200,
    "height": 800
  }'
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:5000/api/collage/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "ds",
    description: "we",
    imageUrls: [
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/c396b964-19fc-482c-bd28-198f959584e6.jpg",
      "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/609b580f-c7a5-40dd-bf2c-1ddc2a061e0e.jpg"
    ],
    layout: "grid",
    width: 1200,
    height: 800
  })
});

const result = await response.json();
console.log(result);
```

## 🎯 Features

- ✅ Sharp-based image processing
- ✅ Multiple layout options (2-10 images)
- ✅ Title and description overlay
- ✅ Automatic image resizing and cropping
- ✅ Error handling with placeholders
- ✅ Base64 image output
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Comprehensive logging
- ✅ Timeout handling
- ✅ Memory optimization

This backend service will handle your collage generation requests exactly as you specified in your example! 