This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Employee Trip Portal Frontend

## Recent Updates

### 🖼️ Poll Image Upload Feature

**New functionality added:**
- **Admin Poll Creation**: Upload images for poll options directly through the admin interface
- **Image Preview**: Real-time preview of uploaded images during poll creation
- **Enhanced Display**: Improved poll option display with images in both user and admin views
- **Auto-refresh**: Removed manual refresh buttons for user polls, quizzes, and treasure hunts - data now auto-refreshes every 30 seconds
- **Multi-step Registration**: Converted registration to a 5-step onboarding wizard with better UX

#### Image Upload Features:
- **File Types**: Supports PNG, JPG, GIF formats
- **Size Limit**: Maximum 5MB per image
- **S3 Integration**: Images are automatically uploaded to S3 and compressed
- **Image Compression**: Images are resized to 800x600 and compressed to 80% quality
- **Responsive Design**: Images display properly on both desktop and mobile
- **Error Handling**: Graceful handling of failed image uploads and missing images

#### API Integration:
The frontend now supports the new multipart/form-data API for poll creation:
```bash
POST /api/votes
Content-Type: multipart/form-data

Form fields:
- title, description, type, startTime, endTime, resultDisplayTime, categoryType
- allowedCategories (JSON array if categoryType is "SPECIFIC")
- optionNames (JSON array of option names)
- optionImages (array of image files)
```

#### Usage:
1. **Create Poll**: Go to Admin → Polls → Create Poll
2. **Add Options**: Add poll options with names
3. **Upload Images**: Click "Click to upload image" for each option (optional)
4. **Preview**: See image previews before submitting
5. **Submit**: Poll is created with images uploaded to S3

#### User Experience:
- **Voting Interface**: Users see poll options with large, prominent images
- **Results Display**: Images are shown alongside voting results and percentages
- **Admin View**: Admin panel shows polls with image thumbnails and enhanced option display
- **Auto-refresh**: User polls, quizzes, and treasure hunts auto-refresh every 30 seconds

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Handling**: Next.js Image component with S3 integration
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **File Upload**: FormData with multipart/form-data
