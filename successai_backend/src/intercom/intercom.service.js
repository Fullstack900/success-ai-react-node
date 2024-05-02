import client from "./intercom-client.js";
import * as tokenService from "../token/token.service.js";
import moment from "moment";
import { Operators } from "intercom-client";
import { intercomLogger } from "../common/utils/logger.js";
import { getUserById, fetchUsersInLast14Days } from "../user/user.service.js";
import { successTierPlans } from "../appsumo/utils/getPlan.js";

export const createUser = async (data,plan) => {
  try {
    const { email, name, _id, createdAt } = data;
    const token = tokenService.generateLoginToken(_id);
    const { first, last } = name;
    const intercomUser = {
      email,
      name: first + " " + last,
      signedUpAt: createdAt,
      customAttributes: {
        account_activated: false,
        verification_link: `${process.env.CLIENT_APP_VERIFY_AUTH_URL}?token=${token}`,
        AppSumoPlan: plan ? successTierPlans[plan?.data?.plan_id] || plan?.data?.plan_id  :null,
        paid : plan ? true : false,
      },
    };
    const user = await client.contacts.createUser(intercomUser);
    const event = {
      eventName: "registered",
      userId: user.id,
      id: user.id,
      email: user.email,
      metadata: plan ?  { appsumo: 'app sumo user registered',} :{},
      createdAt: Math.round(Date.now() / 1000),
      trial_is_on: plan ? false :true,

    };

    await createIntercomEvent(event);
  } catch (err) {
    intercomLogger.error(err);
  }
};
export const findUserFromIntercom = async (email) => {
  try {
    const intercomUser = await client.contacts.search({
      data: {
        query: {
          field: "email",
          operator: Operators.EQUALS,
          value: email,
        },
      },
    });
    return intercomUser.data.find((user) => user.email === email);
  } catch (err) {
    intercomLogger.error(err);
    throw err;
  }
};

export const createIntercomEvent = async (event) => {
  try {
    return await client.events.create(event);
  } catch (err) {
    intercomLogger.error(err);
    throw err;
  }
};

export const createIntercomAttribute = async (attribute) => {
  try {
    await client.contacts.update(attribute);
  } catch (err) {
    intercomLogger.error(err);
    throw err;
  }
};

export const checkIntercomAvailability = async (email) => {
  try {
    const intercomUser = await client.contacts.search({
      data: {
        query: {
          field: "email",
          operator: Operators.EQUALS,
          value: email,
        },
      },
    });

    return intercomUser;
  } catch (error) {
    // console.error("Error checking Intercom availability:", error);
  }
};

export const updateIntercomEmail = async (id, email) => {
  try {
    const response = await client.contacts.update({
      id: id,
      email: email
    });

    return response;
  } catch (error) {
    throw error; 
  }
};



export const updateIntercomTrailAttribute = async () => {
  try {
    const usersInLast14Days = await fetchUsersInLast14Days();

    for (const user of usersInLast14Days) {
      const email = user.email;
      const intercomUser = await checkIntercomAvailability(email);

      if (intercomUser.data.length > 0) {

        // Calculate pending trial days
        const createdDate = moment(user.createdAt);
        const currentDays = moment();
        const pendingTrialDays = Math.max(
          0,
          14 - currentDays.diff(createdDate, "days")
        );

        // Update Intercom contact with pending trial days
        const response = await client.contacts.update({
          id: intercomUser.data[0].id,
          customAttributes: {
            trial_days_left: pendingTrialDays,     
          },
        });

      } else {
        // console.log(`User with email ${email} not found in Intercom.`);
      }
    }

    // Optionally, you can return or do something else with the processed users
    return usersInLast14Days;
  } catch (err) {
    intercomLogger.error(err);
    throw err;
  }
};

export const UpdateIntercomEvent = async (user, event, value) => {
  try {
    const userData = await getUserById(user);
    const intercomUser = await client.contacts.search({
      data: {
        query: {
          field: "email",
          operator: Operators.EQUALS,
          value: userData.email,
        },
      },
    });

    const createEventdata = {
      eventName: event,
      email: userData.email,
      metadata: {},
      createdAt: Math.round(Date.now() / 1000),
    };
    await createIntercomEvent(createEventdata);

    let EventValue;
    const incomingAttributes = intercomUser.data[0].custom_attributes;
    if (incomingAttributes.hasOwnProperty(event)) {
      EventValue = incomingAttributes[event] + 1;
    } else {
      EventValue = value ? value : 1;
    }
    const response = await client.contacts.update({
      id: intercomUser.data[0].id,
      customAttributes: {
        [event]: EventValue,
      },
    });
    return response;
  } catch (err) {
    intercomLogger.error(err);
    throw err;
  }
};
