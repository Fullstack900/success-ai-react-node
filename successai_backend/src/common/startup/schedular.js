import cron from "node-cron";
import {
  startReadEmulation,
  startWarmup,
  startWarmupReply,
  updateUserInboxSpamCount,
  advanceSettingShowMore,
  updateDkimSelector,
  warmupLabelMove,
  updateSentReceivedCountStat,
  warmupStop,
} from "../../warmup/warmup.service.js";

import { resetAppsumoPlandata, resetYearlyPlanData } from "../../billing/billing.service.js";
import {
  processCampaignSchedule,
  // findBounceMail,
  processErrorEmail,
  // getAccountsWithAppSumoRefundDisable
  // getAccountsWithAppSumoRefund
} from "../../campaigns/campaign.service.js";
// import  updateEmailReplies  from "../../unibox/unibox.service.js";
import { leadsCampaignStatusUpdate, leadsCsvStatusUpdate,dailyLeadsCreditsStatusUpdate} from "../../leads/leads.service.js";
// import { updateEmailReplies } from "../../unibox/unibox.service.js";
import { updateIntercomTrailAttribute } from "../../intercom/intercom.service.js";
import { updateEmailEngineAccountStatus, updatePausedAccounts } from "../../account/account.service.js";

import logger from "../utils/logger.js";
import * as crypto from "crypto";
import ms from "ms";
import { migrateData,  removePausedEmailAccounts, removeConnectedEmailAccounts, populateEmailEngineModel, referenceExistingRecords, divideAccounts, removeErrorEmailAccounts, deleteAll } from "../../account/migrationToEmailEngine.js";


export default function schedular() {
  // getAccountsWithAppSumoRefundDisable();
  // getAccountsWithAppSumoRefund();
  if (process.env.NODE_ENV === "local" || process.env.STOP_CRON === "true")
    return;
  // logger.log("Schedular is running...");
  scheduleRandomTask(ms("5m"), ms("10m"), startWarmup);
  scheduleRandomTask(ms("7m"), ms("15m"), startWarmupReply);
  cron.schedule("0 * * * *", startReadEmulation); //Every hour
  cron.schedule("*/17 * * * *", warmupLabelMove); //Every 17 minutes
  cron.schedule("*/26 * * * *", advanceSettingShowMore); //Every 26 minutes
  cron.schedule("0 23 * * *", updateDkimSelector); //At 11:00 PM
  cron.schedule("17 23 * * *", warmupStop); //At 11:17 PM
  scheduleRandomTask(ms("6m"), ms("15m"), updateUserInboxSpamCount);
  cron.schedule("30 22 * * *", resetYearlyPlanData); //At 10:30 PM
  cron.schedule("30 22 * * *", resetAppsumoPlandata); //At 10:30 PM appsumo user's plan update
  // line 2032 in campaign.service.js deals with campaign email sending when cron job runs the calculation there needs to be updated if the processCampaignSchedule time is changed
  cron.schedule("*/15 * * * *", processCampaignSchedule); //Every 15 minutes
  cron.schedule("0 */6 * * *", updateEmailEngineAccountStatus); //Every 6 hour
  cron.schedule("0 */12 * * *", processErrorEmail); //At 0 minutes past the hour, every 12 hours
  // cron.schedule("*/15 * * * *", findBounceMail); //Every 15 minutes
  cron.schedule("0 */2 * * *", leadsCampaignStatusUpdate); //At 0 minutes past the hour, every 2 hours
  cron.schedule("0 * * * *", leadsCsvStatusUpdate); //Every hour
  /*Update Intercom trail period after every 24 hours for new users*/
  cron.schedule("0 3 * * *", updateIntercomTrailAttribute); //At 03:00 AM
  // fetching email replies
  // cron.schedule("*/20 * * * *", () =>
  // updateEmailReplies()
  // ); //Every 20 minutes
  cron.schedule("0 0 * * *", dailyLeadsCreditsStatusUpdate); // The cron job expression "0 0 * * *" specifies that the job runs at midnight, which is equivalent to 12:00 AM.
  // updating stats counts send, received and inbox
  cron.schedule("43 * * * *", updateSentReceivedCountStat); //At 43 minutes past the hour
  // cron.schedule("15 13 * * *", correctingRecords); //At 1:15 PM
  // cron.schedule("15 13 * * *", removePausedEmailAccounts); //At 1:15 PM run first
  // cron.schedule("15 13 * * *", removeConnectedEmailAccounts); //At 1:15 PM run second

  // cron.schedule("30 22 * * *", populateEmailEngineModel);
  // cron.schedule("30 22 * * *", referenceExistingRecords);
  // cron.schedule("30 22 * * *", updatePausedAccounts);
  // cron.schedule("30 22 * * *", divideAccounts);

  // cron.schedule("30 22 * * *", removeErrorEmailAccounts);

  // cron.schedule("30 22 * * *", deleteAll);
  // cron.schedule("30 22 * * *", migrateData);
  
}

function scheduleRandomTask(min, max, task) {
  const randomInterval = crypto.randomInt(min, max);
  setTimeout(() => {
    task();
    scheduleRandomTask(min, max, task);
  }, randomInterval);
}
