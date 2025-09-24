// Environment configuration
// This file provides environment variables for the app

// For now, using hardcoded values to avoid Metro bundler issues
// You can modify these values directly or implement a more sophisticated env loading system

export const API_BASE_URL_PROD = 'https://dressup-api.brainspack.com';
export const API_BASE_URL_DEV = 'http://localhost:3000';
export const API_BASE_URL_ANDROID_FALLBACK = 'http://192.168.29.79:3000';
export const API_BASE_URL_ANDROID_FINAL_FALLBACK = 'http://127.0.0.1:3000';
export const NODE_ENV = 'development';

// TODO: Implement proper environment variable loading
// This could be done with:
// 1. A build-time script that reads .env and generates this file
// 2. A runtime configuration service
// 3. A different env loading library that works better with React Native
