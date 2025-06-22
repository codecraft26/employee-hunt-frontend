const axios = require('axios');

// Test the collage generation API
async function testCollageGeneration() {
  try {
    console.log('Testing collage generation...');
    
    const requestData = {
      title: "ds",
      description: "we",
      imageUrls: [
        "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/c396b964-19fc-482c-bd28-198f959584e6.jpg",
        "https://app-xp.s3.ap-south-1.amazonaws.com/uploads/609b580f-c7a5-40dd-bf2c-1ddc2a061e0e.jpg"
      ],
      layout: "grid",
      width: 1200,
      height: 800
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    const response = await axios.post('http://localhost:5000/api/collage/generate', requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });

    console.log('✅ Success!');
    console.log('Response status:', response.status);
    console.log('Response data:', {
      success: response.data.success,
      processedImages: response.data.data?.processedImages,
      failedImages: response.data.data?.failedImages,
      imageUrlLength: response.data.data?.imageUrl?.length || 0
    });

    if (response.data.data?.imageUrl) {
      console.log('🎨 Collage generated successfully!');
      console.log('Image URL starts with:', response.data.data.imageUrl.substring(0, 50) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test health endpoint
async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting backend tests...\n');
  
  await testHealth();
  console.log('');
  
  await testCollageGeneration();
  console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testCollageGeneration, testHealth }; 