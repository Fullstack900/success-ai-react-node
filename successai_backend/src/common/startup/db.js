import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export default {
  async connect() {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: process.env.DB_POOL_SIZE});
    // logger.log('Connected to MongoDB');
  },
  async disconnect() {
    await mongoose.disconnect();
  },
};
