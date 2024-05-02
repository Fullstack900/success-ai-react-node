import * as uniboxController from './unibox.controller.js';
import auth from '../common/middleware/auth.middleware.js';

import express from 'express';

const router = express.Router();

// router.get('/get', warmupController.warmup);
router.get('/', auth, uniboxController.getAllEmails);
router.delete('/:id', auth, uniboxController.deleteEmails)
router.get('/getReplies', auth, uniboxController.getEmailReplies);
router.post('/sendReplies', auth, uniboxController.sendEmailReplies);
router.post('/sendForward', auth, uniboxController.sendEmailForward);
router.put('/:id', auth, uniboxController.openEmails);
router.post('/accountReply-webhook',uniboxController.email_reply_webhook);



export default router;
