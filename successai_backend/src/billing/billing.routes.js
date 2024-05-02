import express from 'express';
import auth from '../common/middleware/auth.middleware.js';
import * as billingController from './billing.controller.js';
import { validateUpdatePlan } from './billing.validator.js';

const router = express.Router();

router.get('/current-plan', auth, billingController.getCurrentPlan);
router.put(
  '/update-plan',
  [auth, validateUpdatePlan],
  billingController.updatePlan
);
router.get('/lead-credits', auth, billingController.getLeadsCredits);
router.get('/payment-method', auth, billingController.getUserDefaultPaymentMethod);
router.post('/create-portal-session', auth, billingController.createStripPortalSession);
router.delete('/cancel-subscription/:id', auth, billingController.cancelSubscriptions);
router.delete('/cancel-subscription', auth, billingController.cancelAllSubscriptions);
router.get('/get-invoices', auth, billingController.getUserInvoices);

export default router;
