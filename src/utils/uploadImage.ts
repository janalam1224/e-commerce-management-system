import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import path from 'path';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Upload local image (from multer)
export const uploadImageToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Upload image from URL
export const uploadImageToCloudinaryFromUrl = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUrl,
      { folder: 'products' },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary URL upload error:', error); // 🪵 Add this line
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
  });
};

// Delete image from Cloudinary using URL
export const deleteCloudinaryImageByUrl = async (url: string): Promise<void> => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/'); // e.g., [..., 'products', 'abc123.jpg']
    const versionIndex = parts.findIndex(p => /^v\d+$/.test(p));
    if (versionIndex === -1 || versionIndex + 1 >= parts.length) {
      console.warn('⚠️ Could not find version index in URL:', url);
      return;
    }

    const publicIdParts = parts.slice(versionIndex + 1); // e.g., ['products', 'abc123.jpg']
    const fullPath = publicIdParts.join('/');
    const publicId = fullPath.replace(path.extname(fullPath), '');

    console.log('🧹 Attempting to delete Cloudinary public_id:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deletion result:', result);
  } catch (err) {
    console.error('❌ Error deleting Cloudinary image:', err);
  }
};