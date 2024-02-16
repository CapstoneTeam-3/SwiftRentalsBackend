// src/config/index.js
import { config } from 'dotenv';
import cloudinary from 'cloudinary';

config();

if (!process.env.PORT) {
  throw new Error('PORT environment variable is not set');
}


export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

cloudinary.config({
  cloud_name: process.env.IMAGE_STORAGE_CLOUD_NAME,
  api_key: process.env.IMAGE_STORAGE_CLOUD_API_KEY,
  api_secret: process.env.IMAGE_STORAGE_CLOUD_API_SECRET,
});

export const cloudinaryInstance = cloudinary;
