import express from 'express';
import * as tfaController from './tfa.controller.js';
import auth from '../common/middleware/auth.middleware.js';
import { validateVerifyCode } from './tfa.validator.js';

const router = express.Router();

router.post('/send-code', auth, tfaController.sendCode);
router.post('/verify-code', [auth, validateVerifyCode], tfaController.verifyCode);

export default router;
