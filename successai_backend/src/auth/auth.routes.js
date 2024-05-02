import express from 'express';
import * as authController from './auth.controller.js';
import auth from '../common/middleware/auth.middleware.js';
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerify,
  validateResendVerify,
  ValidateAppSumo
} from './auth.validator.js';

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/verifyAppsumo', ValidateAppSumo, authController.validateSumo);
router.post('/verify', validateVerify, authController.verify);
router.post('/login', validateLogin, authController.login);
router.post('/logout', auth, authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/generate-2fa-secret', auth,  authController.generate2faSecret);
router.post('/verify-otp', auth,  authController.verifyOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/resend-verify-link', validateResendVerify, authController.resendVerify);
router.post('/reset-password', [auth, validateResetPassword], authController.resetPassword);
router.get('/user/:email', authController.getUser)
router.put('/user/:id', authController.updateUser)
export default router;
