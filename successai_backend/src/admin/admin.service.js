import * as tokenService from "../token/token.service.js";
import * as userService from "../user/user.service.js";
import Admin from "./model/admin.model.js";
import User from "../user/models/user.model.js";
import bcrypt from "bcrypt";
import HttpErrors from "http-errors";
import * as billingService from "../billing/billing.service.js";
import PlanUsage from "../billing/models/plan-usage.model.js";
import * as appSumoService from "../appsumo/appsumo.service.js";
import UserTypes from "./enum/userType.enum.js";
import moment from "moment";
import Coupon from "../appsumo/models/coupon.model.js";
import UserPlan from "../billing/models/user-plan.model.js";
import * as warmupService from "../warmup/warmup.service.js";
import * as accountService from "../account/account.service.js";
import { warmupSettings } from "../account/warmup.settings.js";
import * as monitorService from '../monitor/monitor.service.js';
import SearchFilter from "../account/enum/search-filter.enum.js";
import mongoose from 'mongoose';
import AccountStatus from "../account/enum/account-status.enum.js";
import WarmupStatus from "../account/enum/warmup-status.enum.js";
import Account from "../account/models/account.model.js";

const {
  SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID,
  SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID,
  SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID,
  SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID,
  SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID,
  SENDING_WARMUP_YEARLY_SCALE_PRICE_ID,
  LEADS_MONTHLY_SKYROCKET_PRICE_ID,
  LEADS_MONTHLY_GROWTH_PRICE_ID,
  LEADS_MONTHLY_SCALE_PRICE_ID,
  LEADS_YEARLY_SKYROCKET_PRICE_ID,
  LEADS_YEARLY_GROWTH_PRICE_ID,
  LEADS_YEARLY_SCALE_PRICE_ID,
} = process.env;

export async function getAccessToken(id) {
  const user = await userService.findById(id);
  if (!user) throw new HttpErrors.Unauthorized("Invalid User ID");
  const authToken = tokenService.generateLoginToken(id);
  return authToken;
}

export function findOne(filter) {
  return Admin.findOne(filter);
}

export function findById(id) {
  return Admin.findById(id);
}

export async function create(adminDetails) {
  const admin = await Admin.create(adminDetails);
  return admin;
}

export async function register(adminDetails) {
  const { email, password } = adminDetails;

  const emailExists = await findOne({ email });
  if (emailExists) throw new HttpErrors.BadRequest("Email already exists");

  adminDetails.password = await bcrypt.hash(password, 10);
  const admin = await create(adminDetails);

  //Send verifictaion mail for admin user
  // await mailerService.sendEmailVerificationMail(admin);
  return admin;
}

export async function verify(token) {
  let adminId;
  try {
    ({ userId: adminId } = tokenService.verifyAuthToken(token));
  } catch {
    throw new HttpErrors.BadRequest("Invalid Token");
  }

  const admin = await update(adminId, { emailVerified: true });

  const authToken = tokenService.generateAuthToken(admin._id);
  return authToken;
}

export async function login({ email, password }) {
  const admin = await findOne({ email });
  if (!admin) throw new HttpErrors.Unauthorized("Invalid email or password");

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    throw new HttpErrors.Unauthorized("Invalid email or password");
  }

  if (!admin.emailVerified) {
    throw new HttpErrors.BadRequest("Email not verified");
  }

  const authToken = tokenService.generateAuthToken(admin._id);
  return authToken;
}

export async function update(id, adminDetails) {
  const admin = await Admin.findByIdAndUpdate(id, adminDetails, { new: true });
  if (!admin) throw new HttpErrors.NotFound("Admin not found");
  return admin;
}

export function logout(admin) {
  return update(admin._id, { lastLogout: new Date() });
}
export async function resetUserPassword(data){

  const user = await User.findOne({ email: data.email });

  const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
  if (isSamePassword) {
    // throw new HttpErrors.Unauthorized("New and old password are same");
    return{
      status: 400,
      message: "New and old password are same"
    }
  }

  const updatedPassword = await bcrypt.hash(data?.newPassword, 10);
  const changePasswordResult = await User.updateOne({email: data?.email}, { $set: { password: updatedPassword } })

  return {
    ...changePasswordResult,
    status: 200,
    message: "Password changed successfully"
  }
  
}
export async function getAllUsers(req) {
  const {
    search,
    sortBy = "createdAt",
    limit = 15,
    page = 1,
    order = "asc",
    userType = UserTypes.Active,
    start,
    end,
  } = req.query;

  const startDate = new Date(parseInt(start));
  const endDate = new Date(parseInt(end));

  // As time selection not provided
  startDate.setHours(0, 0, 0, 0); // Set to the start of the day
  endDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const query = {
    $or: [
      { email: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
      {
        "name.first": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i"),
      },
      {
        "name.last": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i"),
      },
      { warmupTag: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
    ],
  };

  if (start && end) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const { paidUsers, freeUsers } = await getUserCounts();
  const deletedUsers = await User.findDeleted();
  switch (userType) {
    case "Active": {
      query.isDeleted = false;
      break;
    }
    case "Not Active": {
      query.isDeleted = true;
      break;
    }
    case "Paid": {
      query._id = { $in: paidUsers };
      break;
    }
    case "Free": {
      query._id = { $in: freeUsers };
      break;
    }
    case "Appsumo": {
      query.appSumoCode = { $ne: null };
      break;
    }
    case "Appsumo Refunded": {
      query.isAppSumoRefund = true;
      break;
    }
    default:
      break;
  }

  let combinedDocs = [];
  let totalDocs = 0;

  if (userType === "All") {
    const activeUsers = await User.find({ ...query, isDeleted: false })
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const activeCount = await User.countDocuments({
      ...query,
      isDeleted: false,
    });
    const inActiveCount = await User.countDocuments({
      ...query,
      isDeleted: true,
    });
    combinedDocs.push(...activeUsers);
    totalDocs = activeCount + inActiveCount;

    const remainingLimit = limit - activeUsers.length;

    if (remainingLimit > 0) {
      const inactiveUsers = await User.find({ ...query, isDeleted: true })
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .limit(remainingLimit)
        .lean();

      combinedDocs.push(...inactiveUsers);
    }
  } else {
    totalDocs = await User.find(query).countDocuments();

    combinedDocs = await User.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
  }

  const processedUsers = await processUserDetails(combinedDocs);

  const totalPages = Math.ceil(totalDocs / limit);
  const activeUsers = await User.count();
  const appSumoUsers = await User.countDocuments({
    appSumoCode: { $ne: null },
  });
  return {
    docs: processedUsers,
    hasNextPage: Number(page) < totalPages,
    hasPrevPage: Number(page) > 1,
    limit,
    nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
    page: Number(page),
    pagingCounter: (Number(page) - 1) * limit + 1,
    prevPage: Number(page) > 1 ? Number(page) - 1 : null,
    totalDocs,
    totalPages,
    statistics: {
      paidUsers: paidUsers?.length,
      freeUsers: freeUsers?.length,
      deletedUsers: deletedUsers?.length,
      activeUsers,
      appSumoUsers,
    },
  };
}

async function processUserDetails(users) {
  const updatedUsers = [];
  for (const user of users) {
    const plan = await billingService.getUserPlan({ user: user._id });
    updatedUsers.push({
      ...user,
      plan,
    });
  }
  return updatedUsers;
}

export async function usageUpdate(id, data) {
  try {
    const usage = await PlanUsage.findOneAndUpdate({ user: id }, data, {
      returnOriginal: false,
    });
    const user = await userService.findById(id);
    const plan = await billingService.getUserPlan({ user: user._id });
    plan.freeTrialExpiresAt = data.freeTrialExpiresAt;
    await plan.save();
    return usage;
  } catch (error) {
    throw new HttpErrors.BadRequest("Error updating usage:");
  }
}

export async function getPlanUsage(id) {
  try {
    const user = await userService.findById(id);
    const usage = await billingService.findUserPlanUsage(user);
    const plan = await billingService.getUserPlan({ user: user._id });
    const accounts = await accountService.getAllAdmin(user._id);
    const filteredAccounts = accounts.filter(
      (account) =>
        account.warmup?.warmupRejectTotal >= warmupSettings.sendingErrorCount
    );
    const userPlanDetails = { usage, plan, filteredAccounts };
    return userPlanDetails;
  } catch (error) {
    throw new HttpErrors.BadRequest("Error retrieving usage:");
  }
}

export async function cancelSubscription(userId, planId) {
  try {
    const user = await userService.findById(userId);
    const subscription = await billingService.cancelSubscription(
      { user },
      planId
    );
    return subscription;
  } catch (error) {
    throw new HttpErrors.BadRequest("Error While canceling subscription:");
  }
}

export async function updatePassword(id, currentPassword, newPassword) {
  const admin = await Admin.findById(id);
  if (!admin) throw new HttpErrors.NotFound("User not found");

  const isValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isValid) throw new HttpErrors.BadRequest("Invalid password");

  admin.password = await bcrypt.hash(newPassword, 10);
  return admin.save();
}

export async function appSumoRegister(userDetails) {
  const user = await appSumoService.register(userDetails);
  return user;
}

export async function softDeleteUser(id) {
  const numberDeletedElements = await User.softDelete({ _id: id });
  return numberDeletedElements;
}

export async function restoreDeletedUser(id) {
  const numberRestoredElements = await User.restore({ _id: id });
  return numberRestoredElements;
}

export async function findDeletedUsers() {
  const deletedElements = await User.findDeleted();
  return deletedElements;
}
export async function addCoupons(coupons, priceId) {
  const processEntry = async (entry) => {
    try {
      const existingEntry = await Coupon.findOne({ code: entry });
      if (existingEntry) {
        if (existingEntry.isDeleted) {
          await Coupon.restore({ _id: existingEntry._id });
        }
      } else {
        const res = await Coupon.create({ code: entry, priceId: priceId });
      }
    } catch (error) {
      //  console.error(`Error processing entry '${entry}': ${error.message}`);
    }
  };
  const processAllEntries = async () => {
    try {
      await Promise.all(coupons.map(processEntry));
    } catch (error) {
      throw new Error(`Error processing entries: ${error.message}`);
    } finally {
      return { msg: "All coupons added successfully." };
    }
  };
  return await processAllEntries();
}

async function getUserCounts() {
  try {
    const result = await User.aggregate([
      {
        $lookup: {
          from: "user_plans",
          localField: "_id",
          foreignField: "user",
          as: "userPlanDetails",
        },
      },
      {
        $unwind: {
          path: "$userPlanDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          hasActiveLeadsSubscription: {
            $ifNull: ["$userPlanDetails.subscription.leads.active", false],
          },
          hasActiveSendingWarmupSubscription: {
            $ifNull: [
              "$userPlanDetails.subscription.sendingWarmup.active",
              false,
            ],
          },
          hasFreeTrial: {
            $gte: ["$userPlanDetails.freeTrialExpiresAt", moment().toDate()],
          },
        },
      },
      {
        $addFields: {
          isPaidUser: {
            $cond: [
              {
                $or: [
                  "$hasActiveLeadsSubscription",
                  "$hasActiveSendingWarmupSubscription",
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          paidUsers: { $addToSet: { $cond: ["$isPaidUser", "$_id", null] } },
          freeUsers: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasFreeTrial", true] },
                    { $eq: ["$isPaidUser", false] },
                  ],
                },
                "$_id",
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          paidUsers: {
            $filter: {
              input: "$paidUsers",
              as: "paidUser",
              cond: { $ne: ["$$paidUser", null] },
            },
          },
          freeUsers: {
            $filter: {
              input: "$freeUsers",
              as: "freeUser",
              cond: { $ne: ["$$freeUser", null] },
            },
          },
        },
      },
    ]);

    if (result.length > 0) {
      return result[0];
    } else {
      return {
        paidUsers: [],
        freeUsers: [],
      };
    }
  } catch {
    throw new HttpErrors.BadRequest("Error while getting user counts");
  }
}

export async function getExportUsers(req) {
  try {
    const {
      search,
      sortBy = "createdAt",
      limit = 15,
      order = "asc",
      userType = req.query.userType === null
        ? UserTypes.Active
        : req.query.userType,
      start,
      end,
    } = req.query;

    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));

    // As time selection not provided
    startDate.setHours(0, 0, 0, 0); // Set to the start of the day
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day

    const query = {
      $or: [
        { email: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
        {
          "name.first": new RegExp(
            search?.replace(/[^a-zA-Z0-9]/g, "\\$&"),
            "i"
          ),
        },
        {
          "name.last": new RegExp(
            search?.replace(/[^a-zA-Z0-9]/g, "\\$&"),
            "i"
          ),
        },
        {
          warmupTag: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i"),
        },
      ],
    };

    if (start && end) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const { paidUsers, freeUsers } = await getUserCounts();

    switch (userType) {
      case "Active":
        query.isDeleted = false;
        break;
      case "Not Active":
        query.isDeleted = true;
        break;
      case "Paid":
        query._id = { $in: paidUsers };
        break;
      case "Free":
        query._id = { $in: freeUsers };
        break;
      case "Appsumo":
        query.appSumoCode = { $ne: null };
        break;
      case "Appsumo Refunded":
        query.isAppSumoRefund = true;
        break;
      default:
        break;
    }

    let combinedDocs = [];

    if (userType === "All") {
      const [activeUsers] = await Promise.all([
        User.find({ ...query, isDeleted: false })
          .sort({ [sortBy]: order === "asc" ? 1 : -1 })
          .lean(),
      ]);
      combinedDocs.push(...activeUsers);
    } else {
      combinedDocs = await User.find(query)
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .lean();
    }

    return combinedDocs;
  } catch (error) {
    // console.error('Error in getExportUsers:', error);
    throw error;
  }
}

export async function getUserPlan(req) {
  const {
    search,
    sortBy = "createdAt",
    limit = 15,
    page,
    order = "asc",
    start,
    end,
    planType,
  } = req.query;

  let sendingWarmup = [];
  let leads = [];

  const plans = {
    sendingWarmup: {
      growth: [
        SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID,
        SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID,
      ],
      scale: [
        SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID,
        SENDING_WARMUP_YEARLY_SCALE_PRICE_ID,
      ],
      skyrocket: [
        SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID,
        SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID,
      ],
    },

    leads: {
      growth: [LEADS_MONTHLY_GROWTH_PRICE_ID, LEADS_YEARLY_GROWTH_PRICE_ID],
      skyrocket: [
        LEADS_MONTHLY_SKYROCKET_PRICE_ID,
        LEADS_YEARLY_SKYROCKET_PRICE_ID,
      ],
      scale: [LEADS_MONTHLY_SCALE_PRICE_ID, LEADS_YEARLY_SCALE_PRICE_ID],
    },
  };

  switch (planType) {
    case "growth":
      {
        sendingWarmup = [...plans.sendingWarmup.growth];
        leads = [...plans.leads.growth];
      }
      break;
    case "skyrocket":
      {
        sendingWarmup = [...plans.sendingWarmup.skyrocket];
        leads = [...plans.leads.skyrocket];
      }
      break;
    case "scale":
      {
        sendingWarmup = [...plans.sendingWarmup.scale];
        leads = [...plans.leads.scale];
      }
      break;
    default:
      break;
  }

  let planFilter = {};
  if (planType !== "all") {
    planFilter = {
      $or: [
        { "subscription.sendingWarmup.planId": { $in: sendingWarmup } },
        { "subscription.leads.planId": { $in: leads } },
      ],
    };
  } else {
    planFilter = {
      $or: [
        { "subscription.sendingWarmup": { $ne: null } },
        { "subscription.leads": { $ne: null } },
      ],
    };
  }

  const startDate = new Date(parseInt(start));
  const endDate = new Date(parseInt(end));

  // As time selection not provided
  startDate.setHours(0, 0, 0, 0); // Set to the start of the day
  endDate.setHours(23, 59, 59, 999); // Set to the end of the day

  let dateFilter = {};
  if (start && end) {
    dateFilter = {
      "userPlanDetails.createdAt": {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }

  const response = await UserPlan.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userPlanDetails",
      },
    },
    {
      $unwind: {
        path: "$userPlanDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        $and: [
          {
            $or: [
              {
                "userPlanDetails.email": new RegExp(
                  search?.replace(/[^a-zA-Z0-9]/g, "\\$&"),
                  "i"
                ),
              },
              {
                "userPlanDetails.name.first": new RegExp(
                  search?.replace(/[^a-zA-Z0-9]/g, "\\$&"),
                  "i"
                ),
              },
              {
                "userPlanDetails.name.last": new RegExp(
                  search?.replace(/[^a-zA-Z0-9]/g, "\\$&"),
                  "i"
                ),
              },
            ],
          },
          dateFilter,
          {
            $or: [
              { "subscription.sendingWarmup": { $ne: null } },
              { "subscription.leads": { $ne: null } },
            ],
          },
          planFilter,
        ],
      },
    },
    {
      $facet: {
        paginatedResults: [
          {
            $addFields: {
              user: "$userPlanDetails",
            },
          },
          { $skip: (page - 1) * parseInt(limit) },
          { $limit: parseInt(limit) },
          {
            $project: {
              userPlanDetails: 0,
            },
          },
        ],
        totalCount: [{ $count: "value" }],
      },
    },
  ]);
  let docs = [];
  let totalDocs = 0;
  if (response?.length > 0) {
    docs = response[0].paginatedResults;
    totalDocs = response[0]?.totalCount[0]?.value;
  }

  const totalPages = Math.ceil(totalDocs / limit);
  return {
    docs,
    hasNextPage: Number(page) < totalPages,
    hasPrevPage: Number(page) > 1,
    limit,
    nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
    page: Number(page),
    pagingCounter: (Number(page) - 1) * limit + 1,
    prevPage: Number(page) > 1 ? Number(page) - 1 : null,
    totalDocs: totalDocs,
    totalPages,
  };
}

export async function getUserInvoices(req) {
  const { customerId, limit, start, end, startingAfter, endingBefore, page } =
    req.query;

  let created = {};

  if (start && end) {
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));
    // As time selection not provided
    startDate.setHours(0, 0, 0, 0); // Set to the start of the day
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day

    created = {
      gte: startDate,
      lte: endDate,
    };
  }

  const response = await billingService.getUserSubscriptions(
    customerId,
    limit,
    created,
    startingAfter,
    endingBefore
  );

  const totalDocs = response.total_count;
  const totalPages = Math.ceil(totalDocs / limit);

  const hasNextPage = Number(page) < totalPages;
  const hasPrevPage = Number(page) > 1;
  const nextPage = hasNextPage ? Number(page) + 1 : null;
  const prevPage = hasPrevPage ? Number(page) - 1 : null;
  const pagingCounter = (Number(page) - 1) * limit + 1;

  return {
    ...response,
    totalDocs,
    totalPages,
    nextPage,
    prevPage,
    pagingCounter,
  };
}

export async function getExportUserPlans() {
  const response = await UserPlan.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userPlanDetails",
      },
    },
    {
      $unwind: {
        path: "$userPlanDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        $and: [
          {
            $or: [
              { "subscription.sendingWarmup": { $ne: null } },
              { "subscription.leads": { $ne: null } },
            ],
          },
          { userPlanDetails: { $ne: null } },
        ],
      },
    },
    {
      $addFields: {
        user: "$userPlanDetails",
      },
    },
    {
      $project: {
        userPlanDetails: 0,
      },
    },
  ]);

  return response;
}

export async function getFilterUserPlans(req) {
  const { start, end } = req.query;
  let startDate;
  let endDate;

  const sendingWarmup = [
    SENDING_WARMUP_MONTHLY_GROWTH_PRICE_ID,
    SENDING_WARMUP_YEARLY_GROWTH_PRICE_ID,
    SENDING_WARMUP_MONTHLY_SCALE_PRICE_ID,
    SENDING_WARMUP_YEARLY_SCALE_PRICE_ID,
    SENDING_WARMUP_MONTHLY_SKYROCKET_PRICE_ID,
    SENDING_WARMUP_YEARLY_SKYROCKET_PRICE_ID,
  ];

  const lead = [
    LEADS_MONTHLY_GROWTH_PRICE_ID,
    LEADS_YEARLY_GROWTH_PRICE_ID,
    LEADS_MONTHLY_SKYROCKET_PRICE_ID,
    LEADS_YEARLY_SKYROCKET_PRICE_ID,
    LEADS_MONTHLY_SCALE_PRICE_ID,
    LEADS_YEARLY_SCALE_PRICE_ID,
  ];

  const sendingWarmupFilter = [
    { "subscription.sendingWarmup.planId": { $ne: null } },
    { "subscription.sendingWarmup.planId": { $in: sendingWarmup } },
  ];
  const leadsFilter = [
    { "subscription.leads.planId": { $ne: null } },
    { "subscription.leads.planId": { $in: lead } },
  ];
  if (start && end) {
    startDate = new Date(parseInt(start));
    endDate = new Date(parseInt(end));
    // As time selection not provided
    startDate.setHours(0, 0, 0, 0); // Set to the start of the day
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day

    endDate.setDate(endDate.getDate() + 30);
    startDate.setDate(startDate.getDate() + 30);
    sendingWarmupFilter.push({
      "subscription.sendingWarmup.expiresAt": {
        $gte: startDate,
        $lte: endDate,
      },
    });
    leadsFilter.push({
      "subscription.leads.expiresAt": {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  const combinedQuery = await UserPlan.aggregate([
    {
      $facet: {
        sendingWarmups: [
          {
            $match: {
              $and: sendingWarmupFilter,
            },
          },
        ],
        leads: [
          {
            $match: {
              $and: leadsFilter,
            },
          },
        ],
      },
    },
  ]);

  return {
    sendingWarmups: combinedQuery[0].sendingWarmups,
    leads: combinedQuery[0].leads,
  };
}

export async function getRevenueAnalytics(req) {
  const { start, end } = req.query;

  return await billingService.getRevenueData(start, end);
}
export async function getSignupUser(req) {
  const { start, end } = req.query;

  let query = {};

  if (start && end) {
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }
  try {
    const result = await User.find(query).sort({ createdAt: -1 });
    return result;
  } catch (error) {
    console.error("Error fetching user data from MongoDB:", error);
    throw error;
  }
}

export async function deleteUser(req) {
  const response = await userService.deleteUser(req);
  return response
}

export async function updateAppSumoPlan(req){
  const response = await appSumoService.updateAppSumoPlan(req);
  return response
}
export async function getAllRequests(req) {
  const result = await monitorService.getAllRequests(req.query);
  return  result
}

export async function getAllEmailAnalytics(req) {
  const result = await monitorService.getAllEmailAnalytics(req.query);
  return  result
}

export async function getEmailAnalyticsChart(req) {
  const { start, end, type, id, search } = req.query;
  const result = await monitorService.getEmailAnalyticsChart({start, end, type, id, search});
  return  result
}

export async function getAllRequestsChart(req) {
  const { start, end, id, search } = req.query;
  const result = await monitorService.getAllRequestsChart({start, end, id, search});
  return  result
}

export async function getEmailAccounts(req) {
  const { search, filter, offset = 0, limit = 15, start, end, id } = req.query;

  const pipeline = [];

  if (start && end) {
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    pipeline.push({
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy"
    }
  });

  pipeline.push({
    $unwind: "$createdBy"
  });

  if (id) {
    pipeline.push({
      $match: {
        "createdBy._id": new mongoose.Types.ObjectId(id)
      }
    });
  }

  if (search) {
    const regexString = search.replace(/[^a-zA-Z0-9]/g, "\\$&");
    const searchRegex = new RegExp(regexString, "i");

    pipeline.push({
      $match: {
        $or: [
          { email: searchRegex },
          { "createdBy.email": searchRegex }
        ]
      }
    });
  }

  switch (filter) {
    case SearchFilter.Paused:
      pipeline.push({
        $match: {
          status: AccountStatus.Paused
        }
      });
      break;
    case SearchFilter.HasErrors:
      pipeline.push({
        $match: {
          status: { $in: [AccountStatus.Reconnect, AccountStatus.Disconnected] }
        }
      });
      break;
    case SearchFilter.NoCustomTrackingDomain:
      pipeline.push({
        $match: {
          "customDomain.isEnable": false
        }
      });
      break;
    case SearchFilter.WarmupActive:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Enabled
        }
      });
      break;
    case SearchFilter.WarmupPaused:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Paused
        }
      });
      break;
    case SearchFilter.WarmupHasErrors:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Disabled
        }
      });
      break;
  }

  pipeline.push({
    $group: {
      _id: null,
      total: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  });

  pipeline.push({
    $project: {
      _id: 0,
      total: 1,
      docs: { $slice: ["$docs", Number(offset), Number(limit)] }
    }
  });

  const result = await Account.aggregate(pipeline);

  const { docs, total } = result.length > 0 ? result[0] : { docs: [], total: 0 };

  return { docs, total };
}

export async function updateEmailAccounts(userDetails) {
  const response = await accountService.updateEmailAccounts(userDetails);
  return response;
}

export async function getEmailAccountsAnalytics(req, res) {
  const {userId, search, start, end} = req.query;
  const response = await accountService.getAccountAnalytics(userId, search, start, end);
  return response;
}

export async function getExportAccounts(req) {
  const { search, filter, start, end, id } = req.query;

  const pipeline = [];

  if (start && end) {
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    pipeline.push({
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy"
    }
  });

  pipeline.push({
    $unwind: "$createdBy"
  });

  if (id) {
    pipeline.push({
      $match: {
        "createdBy._id": new mongoose.Types.ObjectId(id)
      }
    });
  }

  if (search) {
    const regexString = search.replace(/[^a-zA-Z0-9]/g, "\\$&");
    const searchRegex = new RegExp(regexString, "i");

    pipeline.push({
      $match: {
        $or: [
          { email: searchRegex },
          { "createdBy.email": searchRegex }
        ]
      }
    });
  }

  switch (filter) {
    case SearchFilter.Paused:
      pipeline.push({
        $match: {
          status: AccountStatus.Paused
        }
      });
      break;
    case SearchFilter.HasErrors:
      pipeline.push({
        $match: {
          status: { $in: [AccountStatus.Reconnect, AccountStatus.Disconnected] }
        }
      });
      break;
    case SearchFilter.NoCustomTrackingDomain:
      pipeline.push({
        $match: {
          "customDomain.isEnable": false
        }
      });
      break;
    case SearchFilter.WarmupActive:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Enabled
        }
      });
      break;
    case SearchFilter.WarmupPaused:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Paused
        }
      });
      break;
    case SearchFilter.WarmupHasErrors:
      pipeline.push({
        $match: {
          "warmup.status": WarmupStatus.Disabled
        }
      });
      break;
  }

  pipeline.push({
    $group: {
      _id: null,
      total: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  });

  pipeline.push({
    $project: {
      _id: 0,
      total: 1,
      docs: 1
    }
  });

  const result = await Account.aggregate(pipeline);

  const { docs } = result.length > 0 ? result[0] : { docs: [], total: 0 };
  return docs;
}

export async function getDkimData(req) {
  const response = await accountService.getDKIMDataofAccount(req.body);
  return response;
}
