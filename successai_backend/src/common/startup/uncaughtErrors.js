import logger from '../utils/logger.js';

export default function uncaughtErrors() {
  process.on('uncaughtException', (err) => {
    // logger.error('uncaughtException', err);
  });
}
