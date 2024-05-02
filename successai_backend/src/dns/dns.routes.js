import express from 'express';
import * as dnsController from './dns.controller.js';
import auth from '../common/middleware/auth.middleware.js';

const router = express.Router();

router.post('/vitals', [auth], dnsController.vitals);
router.post('/check_domain_dns', [auth], dnsController.checkDns);
router.post('/check_domain_ssl', [auth], dnsController.checkSSL);
router.get('/ssl_approval', dnsController.checkSSLApproval);


export default router;
