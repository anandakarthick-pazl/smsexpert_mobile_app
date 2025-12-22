/**
 * Type declarations for environment variables
 * Used with react-native-dotenv
 */

declare module '@env' {
  export const APP_ENV: 'local' | 'development' | 'production';
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string;
}
