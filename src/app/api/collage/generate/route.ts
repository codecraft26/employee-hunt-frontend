import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      imageUrls, 
      layout = 'grid',
      width = 1200,
      height = 800 
    } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No images provided' },
        { status: 400 }
      );
    }

    // Validate image count
    if (imageUrls.length > 10) {
      return NextResponse.json(
        { success: false, message: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    console.log('Starting collage generation with', imageUrls.length, 'images');

    // Create a base canvas with white background
    const baseCanvas = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    // Load and process images with timeout and better error handling
    const processedImages = await Promise.all(
      imageUrls.map(async (imageUrl: string, index: number) => {
        try {
          console.log(`Processing image ${index + 1}: ${imageUrl}`);
          
          // Fetch image from URL with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CollageGenerator/1.0)'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          const imageBuffer = await response.arrayBuffer();
          
          if (imageBuffer.byteLength === 0) {
            throw new Error('Empty image buffer received');
          }
          
          // Process image with Sharp
          const processedImage = await sharp(Buffer.from(imageBuffer))
            .resize(300, 300, { 
              fit: 'cover',
              position: 'center'
            })
            .png(); // Convert to PNG for transparency support
          
          console.log(`Successfully processed image ${index + 1}`);
          
          return {
            buffer: await processedImage.toBuffer(),
            index,
            success: true
          };
        } catch (error) {
          console.error(`Failed to process image ${index + 1}:`, error);
          // Create a placeholder image
          const placeholder = await createPlaceholderImage(300, 300, `Image ${index + 1}`);
          return {
            buffer: placeholder,
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    console.log('All images processed, calculating layout');

    // Calculate layout positions
    const layoutPositions = calculateLayout(imageUrls.length, width, height);

    // Create composite operations for Sharp
    const composites = [];
    
    // Add title text
    if (title) {
      const titleSvg = createTextSvg(title, width, 60, {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1f2937'
      });
      composites.push({
        input: Buffer.from(titleSvg),
        top: 20,
        left: 0
      });
    }

    // Add description text
    if (description) {
      const descSvg = createTextSvg(description, width, 100, {
        fontSize: 24,
        color: '#6b7280'
      });
      composites.push({
        input: Buffer.from(descSvg),
        top: 80,
        left: 0
      });
    }

    // Add images to composite
    for (let index = 0; index < processedImages.length; index++) {
      const image = processedImages[index];
      const position = layoutPositions[index];
      if (position) {
        try {
          // Create rounded corners mask
          const roundedImage = sharp(image.buffer)
            .resize(position.width, position.height, { fit: 'cover' });
          
          composites.push({
            input: await roundedImage.toBuffer(),
            top: position.y,
            left: position.x
          });
        } catch (error) {
          console.error(`Failed to add image ${index} to composite:`, error);
        }
      }
    }

    // Add footer text
    const footerText = `Created on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    const footerSvg = createTextSvg(footerText, width, height - 40, {
      fontSize: 16,
      color: '#9ca3af'
    });
    composites.push({
      input: Buffer.from(footerSvg),
      top: height - 60,
      left: 0
    });

    console.log('Generating final collage');

    // Generate final collage
    const collageBuffer = await baseCanvas
      .composite(composites)
      .jpeg({ quality: 90 }) // Reduced quality for better performance
      .toBuffer();

    console.log('Collage generated successfully');

    // Convert to base64 for response
    const base64Image = `data:image/jpeg;base64,${collageBuffer.toString('base64')}`;

    const failedImages = processedImages.filter(img => !img.success);
    if (failedImages.length > 0) {
      console.warn(`${failedImages.length} images failed to process:`, failedImages.map(img => img.error));
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: base64Image,
        processedImages: processedImages.length,
        failedImages: failedImages.length,
        failedImageErrors: failedImages.map(img => ({ index: img.index, error: img.error }))
      }
    });

  } catch (error) {
    console.error('Collage generation error:', error);
    
    // More specific error messages
    let errorMessage = 'Failed to generate collage';
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('abort')) {
        errorMessage = 'Request timeout - some images took too long to process';
      } else if (error.message.includes('memory')) {
        errorMessage = 'Memory limit exceeded - try with fewer images';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to calculate layout positions
function calculateLayout(imageCount: number, canvasWidth: number, canvasHeight: number) {
  const margin = 20;
  const titleHeight = 120;
  const footerHeight = 60;
  const availableHeight = canvasHeight - titleHeight - footerHeight - margin * 2;
  const availableWidth = canvasWidth - margin * 2;

  const layouts: { [key: number]: Array<{x: number, y: number, width: number, height: number}> } = {
    2: [
      { x: margin, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight },
      { x: availableWidth / 2 + margin / 2, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight }
    ],
    3: [
      { x: margin, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: availableWidth / 2 + margin / 2, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: margin, y: titleHeight + availableHeight / 2 + margin / 2, width: availableWidth, height: availableHeight / 2 - margin / 2 }
    ],
    4: [
      { x: margin, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: availableWidth / 2 + margin / 2, y: titleHeight + margin, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: margin, y: titleHeight + availableHeight / 2 + margin / 2, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: availableWidth / 2 + margin / 2, y: titleHeight + availableHeight / 2 + margin / 2, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 }
    ],
    5: [
      { x: margin, y: titleHeight + margin, width: availableWidth / 3 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: availableWidth / 3 + margin / 2, y: titleHeight + margin, width: availableWidth / 3 - margin, height: availableHeight / 2 - margin / 2 },
      { x: 2 * availableWidth / 3 + margin / 2, y: titleHeight + margin, width: availableWidth / 3 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: margin, y: titleHeight + availableHeight / 2 + margin / 2, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 },
      { x: availableWidth / 2 + margin / 2, y: titleHeight + availableHeight / 2 + margin / 2, width: availableWidth / 2 - margin / 2, height: availableHeight / 2 - margin / 2 }
    ]
  };

  // For 6+ images, use a grid layout
  if (imageCount > 5) {
    const cols = Math.ceil(Math.sqrt(imageCount));
    const rows = Math.ceil(imageCount / cols);
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    
    const gridLayout = [];
    for (let i = 0; i < imageCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      gridLayout.push({
        x: margin + col * cellWidth,
        y: titleHeight + margin + row * cellHeight,
        width: cellWidth - margin,
        height: cellHeight - margin
      });
    }
    return gridLayout;
  }

  return layouts[imageCount] || layouts[4];
}

// Helper function to create text SVG
function createTextSvg(text: string, width: number, y: number, options: {
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}) {
  const fontSize = options.fontSize || 16;
  const fontWeight = options.fontWeight || 'normal';
  const color = options.color || '#000000';
  
  return `<svg width="${width}" height="${fontSize + 20}" xmlns="http://www.w3.org/2000/svg">
    <text x="${width / 2}" y="${y}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="${fontWeight}" 
          fill="${color}" 
          text-anchor="middle">
      ${text}
    </text>
  </svg>`;
}

// Helper function to create placeholder image
async function createPlaceholderImage(width: number, height: number, text: string) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
    <text x="${width / 2}" y="${height / 2 - 10}" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          fill="#6b7280" 
          text-anchor="middle">
      📷
    </text>
    <text x="${width / 2}" y="${height / 2 + 10}" 
          font-family="Arial, sans-serif" 
          font-size="12" 
          fill="#6b7280" 
          text-anchor="middle">
      ${text}
    </text>
  </svg>`;

  return Buffer.from(svg);
} 