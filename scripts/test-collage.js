const sharp = require('sharp');

async function testSharp() {
  try {
    console.log('Testing Sharp installation...');
    
    // Create a simple test image
    const testImage = sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    });
    
    const buffer = await testImage.png().toBuffer();
    console.log('✅ Sharp is working correctly!');
    console.log('Buffer size:', buffer.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Sharp test failed:', error.message);
    return false;
  }
}

async function testImageProcessing() {
  try {
    console.log('Testing image processing capabilities...');
    
    // Create a test image and process it
    const testImage = sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 0, g: 255, b: 0, alpha: 1 }
      }
    });
    
    // Test resize operation
    const resized = await testImage
      .resize(100, 100, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    console.log('✅ Image processing is working correctly!');
    console.log('Resized image size:', resized.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Image processing test failed:', error.message);
    return false;
  }
}

async function testComposite() {
  try {
    console.log('Testing composite operations...');
    
    // Create base canvas
    const baseCanvas = sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });
    
    // Create a test image to composite
    const testImage = sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    });
    
    const imageBuffer = await testImage.png().toBuffer();
    
    // Test composite operation
    const composite = await baseCanvas
      .composite([{
        input: imageBuffer,
        top: 50,
        left: 50
      }])
      .jpeg({ quality: 90 })
      .toBuffer();
    
    console.log('✅ Composite operations are working correctly!');
    console.log('Composite image size:', composite.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Composite test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Running collage API tests...\n');
  
  const sharpTest = await testSharp();
  const processingTest = await testImageProcessing();
  const compositeTest = await testComposite();
  
  console.log('\n--- Test Results ---');
  console.log('Sharp Installation:', sharpTest ? '✅ PASS' : '❌ FAIL');
  console.log('Image Processing:', processingTest ? '✅ PASS' : '❌ FAIL');
  console.log('Composite Operations:', compositeTest ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = sharpTest && processingTest && compositeTest;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Collage API should work correctly.');
    console.log('Note: Fetch functionality will be tested in the browser environment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the Sharp installation.');
  }
  
  return allPassed;
}

runTests().catch(console.error); 