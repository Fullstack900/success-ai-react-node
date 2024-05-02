import * as azureService from "../../common/services/azure.service.js"
import Account from "../../account/models/account.model.js"
import WarmupConst from "../../account/enum/warmup-status.enum.js"
import Provider from "../../account/enum/provider.enum.js"

export async function fetchWarmupEmails(size = 10, filter = "") {

    const fetchEmails = await Account.aggregate(
        [{
            $sample: {
                size: size
            }
        }, {
            $unwind: '$warmup'
        }, {
            $match: {
                "warmup.status": WarmupConst.Enabled
            }
        }]
    )

    return fetchEmails
}

export async function warmupAccount(accounts) {
  for (const account of accounts) {
      try {
          const lastSendCount = 2;
          const todayAlreadySent = 1;
          const yesterdayReceivedMail = 20;

          const filter = account.warmup.filterTag;
          const sendLimit = lastSendCount + account.warmup.basicSetting.increasePerDay - todayAlreadySent;
          const todaySendLimit = Math.min(sendLimit, account.warmup.basicSetting.limitPerDay);
          const replyLimit = Math.round((todaySendLimit * account.warmup.basicSetting.replyRate) / 100);
          const totalSend = todaySendLimit - replyLimit;
          const limit = Math.min(totalSend, 20);

          const warmupEmails = await fetchWarmupEmails(limit, filter);
          const emailArray = warmupEmails.map(emailData => ({ name: emailData.name, email: emailData.email, filterTag: emailData.warmup.filterTag }));

          await sendMail(account, emailArray);
      } catch (error) {
          // console.error(`Error during warmup for account ${account.id}:`, error);
      }
  }
}


export async function sendMail(element, emailarray) {

  const {
        provider
    } = element
    if (provider === Provider.Microsoft_OAuth){
        await sendMicrosoftEmail()
    }

  }