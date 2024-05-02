import * as warmupController from './warmup.controller.js';
import express from 'express';
import auth from '../common/middleware/auth.middleware.js';
import { validateBlockListEmail } from './warmup.validator.js';

const router = express.Router();

router.get('/get', warmupController.warmup);
router.post('/add-blocklist-emails', [auth, validateBlockListEmail], warmupController.addBlocklistEmails);
router.get('/get-blocklist-emails', [auth], warmupController.getBlocklistEmails);
router.delete('/delete-blocklist-emails', [auth], warmupController.deleteBlockList);
//router.post('/sendmail', warmupController.sendmail); //TESTBYPS
export default router;
