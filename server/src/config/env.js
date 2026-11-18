import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  CAMPUS_ID: process.env.CAMPUS_ID || 'apex-campus-main',
  DATA_DIR: process.env.DATA_DIR || './data',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  JWT_SECRET: process.env.JWT_SECRET || 'ccmms_super_secret_jwt_key_2026_apex_campus',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'ccmms_super_secret_refresh_jwt_key_2026_apex_campus',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
};
