import logger from '../utils/logger.js';
import { isHttpError } from 'http-errors';

export default function errorMiddleware(err, req, res, next) {
  if (isHttpError(err)) {
    return res.status(err.status).send({ error: err });
  }

  // logger.error(err);

  res.status(500).send({
    error: { message: 'Internal Server Error', description: err.message },
  });

  return next(err);
}
