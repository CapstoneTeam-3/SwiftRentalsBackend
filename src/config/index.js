// src/config/index.js
import { config } from 'dotenv';

config();

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

