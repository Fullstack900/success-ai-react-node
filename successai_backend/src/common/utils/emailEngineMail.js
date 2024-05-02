import axios from "axios";
import Account from "../../account/models/account.model.js";

export async function sendEmailEngineMail(accountId, data) {
  const account = await Account.findOne({emailEngineAccountId: accountId}).populate('connectionWith')

  const {ip: EMAIL_ENGINE_URL, accessToken} = account.connectionWith
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${EMAIL_ENGINE_URL}/v1/account/${accountId}/submit?access_token=${accessToken}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      'x-ee-timeout': 60000,
    },
    data: data,
  };
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}
