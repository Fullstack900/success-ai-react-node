import express from "express";
import authRoutes from "../../auth/auth.routes.js";
import userRoutes from "../../user/user.routes.js";
import tfaRoutes from "../../tfa/tfa.routes.js";
import accountRoutes from "../../account/account.routes.js";
import dnsRoutes from "../../dns/dns.routes.js";
import warmupRoutes from "../../warmup/warmup.routes.js";
import billingRoutes from "../../billing/billing.routes.js";
import leadsRoutes from "../../leads/leads.routes.js";
import campaignRoutes from "../../campaigns/campaign.routes.js";
import uniBoxRoutes from "../../unibox/unibox.routes.js";
import adminRoutes from "../../admin/admin.routes.js";
import appSumoRoutes from "../../appsumo/appsumo.routes.js";
import intercomRoutes from "../../intercom/intercom.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tfa", tfaRoutes);
router.use("/accounts", accountRoutes);
router.use("/dns", dnsRoutes);
router.use("/warmup", warmupRoutes);
router.use("/billing", billingRoutes);
router.use("/leads", leadsRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/unibox", uniBoxRoutes);
router.use("/admin", adminRoutes);
router.use("/appsumo", appSumoRoutes);
router.use("/intercom", intercomRoutes);

export default router;
