'use server';

import { generateCollage } from '../../utils/collageGenerator';

type CollageSuccessResult = {
  success: true;
  data: {
    imageUrl: string;
    processedImages: number;
    failedImages: number;
    failedImageErrors: { index: number; error: string | undefined; }[];
  };
};

type CollageErrorResult = {
  success: false;
  message: string;
};

type CollageResult = CollageSuccessResult | CollageErrorResult;

export async function generateCollageAction(params: {
  title?: string;
  description?: string;
  imageUrls: string[];
  layout?: string;
  width?: number;
  height?: number;
}): Promise<CollageResult> {
  try {
    const result = await generateCollage(params);
    if (result.success) {
      return result as CollageSuccessResult;
    } else {
      return {
        success: false,
        message: 'Failed to generate collage'
      };
    }
  } catch (error) {
    console.error('Collage generation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate collage'
    };
  }
} 