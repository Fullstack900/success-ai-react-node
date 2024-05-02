import express from 'express';
import auth from '../common/middleware/auth.middleware.js';
import * as accountController from './account.controller.js';
import {
  validateConnectGoogleImapSmtp,
  validateConnectCustomImapSmtpAccount,
  validateConnectGoogleAccount,
  validateConnectMicrosoftAccount,
  validateGetAll,
  validateTestImapOrSmtp,
  validateUpdate,
  validateBulkDelete,
} from './account.validator.js';
import timeout from 'connect-timeout';

const router = express.Router();

router.post(
  '/google',
  [auth, validateConnectGoogleAccount],
  accountController.connectGoogleAccount
);

router.post(
  '/google-imap-smtp',
  [auth, validateConnectGoogleImapSmtp],
  accountController.connectGoogleImapSmtp
);

router.post(
  '/microsoft',
  [auth, validateConnectMicrosoftAccount],
  accountController.connectMicrosoftAccount
);

router.post(
  '/custom-imap-smtp',
  [auth, validateConnectCustomImapSmtpAccount],
  accountController.connectCustomImapSmtpAccount
);

router.get('/me', [auth, validateGetAll], accountController.getAll);
router.get('/account', auth, accountController.getAccount);
router.put('/:id', [auth, validateUpdate], accountController.update);
router.put('/:id/pause', auth, accountController.pauseAccount);
router.put('/:id/resume', auth, accountController.resumeAccount);
router.put('/:id/warmup/pause', auth, accountController.pauseWarmup);
router.put('/:id/warmup/enable', auth, accountController.enableWarmup);
router.delete('/bulk', [auth, validateBulkDelete], accountController.bulkDelete);
router.delete('/:id', auth, accountController.remove);

router.post(
  '/test-imap',
  [auth, validateTestImapOrSmtp, timeout('120s')],
  accountController.testImap
);

router.post(
  '/test-smtp',
  [auth, validateTestImapOrSmtp, timeout('120s')],
  accountController.testSmtp
);

router.post(
  '/test-smtp-and-imap',
  [auth, timeout('60s')],
  accountController.testSmtpImap
);

router.post('/authentication-webhook', accountController.accountAuthenticationWebhook)
router.post('/authentication-success-webhook', accountController.accountAuthenticationSuccessWebhook);

export default router;
