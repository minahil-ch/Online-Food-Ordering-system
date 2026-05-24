import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

const configured =
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret;

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export async function uploadImage(
  buffer: Buffer,
  folder = 'food-ordering'
): Promise<string> {
  if (!configured) {
    return `https://placehold.co/400x300?text=Food`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
