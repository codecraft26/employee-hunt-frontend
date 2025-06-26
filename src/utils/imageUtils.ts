/**
 * Utility functions for image processing and compression
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: string;
}

/**
 * Compress an image file to reduce its size while maintaining quality
 */
export const compressImage = (
  file: File,
  options: CompressImageOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'image/jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');

    if (!ctx) {
      reject(new Error('Unable to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.jpg'),
              {
                type: outputFormat,
                lastModified: Date.now(),
              }
            );
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        outputFormat,
        quality
      );

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  // if (file.size > maxSize) {
  //   return 'Image size should be less than 5MB';
  // }

  return null;
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
