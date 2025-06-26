import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

// S3 Configuration from environment variables
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'app-xp';
const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

if (!AWS_REGION || !S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.warn('Missing AWS configuration. S3 upload will not work.');
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

export interface S3UploadResult {
  url: string;
  key: string;
}

export const uploadImageToS3 = async (
  file: File,
  folder: string = 'uploads'
): Promise<S3UploadResult> => {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExt}`;

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: file.type,
    // Optional: Set ACL to public-read if you want direct access
    // ACL: 'public-read',
  });

  try {
    await s3.send(command);
    
    // Return the public URL
    const url = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    
    return {
      url,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  const result = await uploadImageToS3(file, 'profile-images');
  return result.url;
};

export const uploadIdProof = async (file: File): Promise<string> => {
  const result = await uploadImageToS3(file, 'id-proofs');
  return result.url;
};

// Utility function to validate image files before upload
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'
    };
  }

  // if (file.size > maxSize) {
  //   return {
  //     isValid: false,
  //     error: 'File size exceeds 5MB limit.'
  //   };
  // }

  return { isValid: true };
};

// Utility function to validate document files (for ID proof)
export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocTypes = ['application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const isValidImage = allowedImageTypes.includes(file.type.toLowerCase());
  const isValidDoc = allowedDocTypes.includes(file.type.toLowerCase());

  if (!isValidImage && !isValidDoc) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF document.'
    };
  }

  // if (file.size > maxSize) {
  //   return {
  //     isValid: false,
  //     error: 'File size exceeds 5MB limit.'
  //   };
  // }

  return { isValid: true };
};
