import * as warmupController from "./warmUpEmails.controller.js"
import express from 'express';

const router = express.Router();

router.get(
  '/get',
  warmupController.warmup
);

export default router;