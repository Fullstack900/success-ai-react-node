import express from "express";
import * as adminController from "./admin.controller.js";
import auth, { adminAuth } from "../common/middleware/auth.middleware.js";
import * as accountController from '../account/account.controller.js';
import {
  validateToken,
  validateRegister,
  validateVerify,
  validateLogin,
  validateGetUsers,
  validateUpdatePassword,
  validateUpdate,
  validateAppSumoRegister,
  validateAddCoupons,
} from "./admin.validator.js";

const router = express.Router();

router.get('/me', adminAuth, adminController.adminDetails);
router.post(
  "/token",
  [validateToken, adminAuth],
  adminController.getAccessToken
);
router.post("/register", [validateRegister, adminAuth], adminController.register);
router.post("/verify", validateVerify, adminController.verify);
router.post("/login", validateLogin, adminController.login);
router.post("/logout", auth, adminController.logout);

router.get(
  "/getAllUsers",
  [adminAuth, validateGetUsers],
  adminController.getAllUsers
);
router.put('/update-usage/:id', adminAuth, adminController.updateUsage);
router.put("/updateUserPasswordByAdmin/:id", adminAuth, adminController.resetUserPassword);
router.get('/user-usage/:id', adminAuth, adminController.getPlanUsage);

router.post(
  "/cancel-subscription",
  [adminAuth],
  adminController.cancelSubscription
);

router.put(
  '/me/password',
  [adminAuth, validateUpdatePassword],
  adminController.updatePassword
);

router.post('/app-sumo-register', [adminAuth, validateAppSumoRegister], adminController.appSumoRegister);
router.put('/me', [adminAuth, validateUpdate], adminController.update);
router.get('/intercom-log',adminController.getInterComLogs );
router.post("/disable-user", adminAuth, adminController.disableUser);
router.post("/enable-user", adminAuth, adminController.enableUser);
router.post("/deleted-users", adminAuth, adminController.deletedUsers);
router.post("/add-coupons", [adminAuth, validateAddCoupons], adminController.addCoupons);
router.get(
  "/getExportUsers",
  [adminAuth],
  adminController.getExportUsers
);
router.get(
  "/getUserPlans",
  [adminAuth],
  adminController.getUserPlan
);
router.get(
  "/getExportUserPlans",
  [adminAuth],
  adminController.getExportUserPlans
);

router.get(
  "/getUserSubscriptions",
  [adminAuth],
  adminController.getUserSubscriptions
);
router.get(
  "/getFilterUserPlans",
  [adminAuth],
  adminController.getFilterUserPlans
);

router.get(
  "/getRevenueAnalytics",
  [adminAuth],
  adminController.getRevenueAnalytics
);

router.put('/:id/warmup/enable', [adminAuth], accountController.enableWarmupAdmin);

router.get('/getSignupUser',[adminAuth], adminController.getSignupUser)
router.post("/delete-user", adminAuth, adminController.deleteUser);
router.post("/update-appsumo-plan", adminAuth, adminController.updateAppSumoPlan);

router.get(
  "/getAllRequests",
  [adminAuth],
  adminController.getAllRequests
);

router.get(
  "/getAllEmailAnalytics",
  [adminAuth],
  adminController.getAllEmailAnalytics
);

router.get(
  "/getEmailAnalyticsChart",
  [adminAuth],
  adminController.getEmailAnalyticsChart
);

router.get(
  "/getAllRequestsChart",
  [adminAuth],
  adminController.getAllRequestsChart
);

router.get('/email-accounts', adminAuth, adminController.getEmailAccounts);
router.get('/email-account-analytics', adminAuth, adminController.getEmailAccountsAnalytics);
router.get('/export-email-accounts', adminAuth, adminController.getExportAccounts);
router.post('/update-email-accounts', adminAuth, adminController.updateEmailAccounts);
router.post('/email-dkim-data', adminAuth, adminController.getDkimData);
router.post("/delete-user", adminAuth, adminController.deleteUser);
router.post("/update-appsumo-plan", adminAuth, adminController.updateAppSumoPlan);

export default router;
