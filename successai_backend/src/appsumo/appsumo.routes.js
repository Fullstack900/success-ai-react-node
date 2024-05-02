import express from 'express';
import * as appsumoController from './appsumo.controller.js';
import {
    validateGetToken,
    validateNotification
} from './appsumo.validator.js';
import { appSumoAuth } from '../common/middleware/auth.middleware.js';

const router = express.Router();

router.post('/token', validateGetToken, appsumoController.getAccessToken);
router.post('/notification', [appSumoAuth, validateNotification], appsumoController.licenceUpdate);


export default router;
