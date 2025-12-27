import appConfig from '@shared/config/app.config.ts';
import mongoose from 'mongoose';


export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(appConfig.db_url as string, {
      maxPoolSize: 10, // Limit connection pool to prevent "max connections" errors on free tier
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  return mongoose.disconnect();
};