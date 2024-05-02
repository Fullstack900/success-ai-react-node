import HttpErrors from "http-errors";
import User from "./models/user.model.js";
import EmailVerifyCode from "./models/email-verify-code.model.js";
import bcrypt from "bcrypt";
import moment from "moment";
import * as crypto from "crypto";
import * as mailerService from "../mailer/mailer.service.js";
import {
  createAppSumoUserPlan,
  createAppSumoUserUsage,
  createUserPlan,
} from "../billing/billing.service.js";
import { deleteCoupon } from "../appsumo/appsumo.service.js";
import UserEmails from "./models/user-emails.modal.js";
import UserPlan from "../billing/models/user-plan.model.js";
import PlanUsage from "../billing/models/plan-usage.model.js";
import Productlicence from "../appsumo/models/productlicence.model.js";

export async function create(userDetails) {
  const { email, password, sumo } = userDetails;
  const user = await User.create(userDetails);
  const stripeCustomerId = await createUserPlan(user, sumo);
  return { user, stripeCustomerId };
}

export async function validateAndCreateUser(userDetails, licenceData) {
  const { email, password, licence } = userDetails;
  userDetails.appSumoCode = licence;
  userDetails.assignedPlan = licenceData?.data?.plan_id;
  const user = await User.create(userDetails);
  await createAppSumoUserUsage(user, licenceData);
  return user;
}

export function findOne(filter) {
  return User.findOne(filter);
}

export function findById(id) {
  return User.findById(id);
}

export async function getAllReplyEmails(id) {
  const user = await UserEmails.find({ userId: id });
  if (!user) throw new HttpErrors.NotFound("User not found");
  return user;
}
export async function update(id, userDetails) {
  const user = await User.findByIdAndUpdate(id, userDetails, { new: true });
  if (!user) throw new HttpErrors.NotFound("User not found");
  return user;
}

export async function sendEmailVerifyCode(email) {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();

  const emailExists = await User.findOne({ email });
  if (emailExists) throw new HttpErrors.BadRequest("Email already exists");

  mailerService.sendCodeMail(email, code);

  await EmailVerifyCode.deleteMany({ email });
  return EmailVerifyCode.create({ email, code });
}

export async function sendVerificationCode(email, user) {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const emailExists = await UserEmails.findOne({
    email: email,
    userId: user._id,
  });
  if (emailExists) {
    emailExists.verificationCode = code;
    await emailExists.save();
  } else {
    const emailVerification = new UserEmails({
      userId: user._id,
      email,
      verificationCode: code,
    });
    await emailVerification.save();
  }
  mailerService.sendVerifyReplyEmail(email, code);
  return code;
}

export async function verifyReplyEmailCode(code) {
  const codeExists = await UserEmails.findOne({ verificationCode: code });
  if (!codeExists) throw new HttpErrors.BadRequest("Invalid link");
  codeExists.isVerified = true;
  const data = await codeExists.save();
  return data;
}

export async function updateEmail(id, code, email) {
  const emailExists = await User.findOne({ email });
  if (emailExists) throw new HttpErrors.BadRequest("Email already exists");

  const evCode = await EmailVerifyCode.findOne({ email, code });
  if (!evCode) throw new HttpErrors.BadRequest("Invalid Code");

  await evCode.deleteOne();

  return update(id, { email });
}
export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new HttpErrors.NotFound("User not found");
  return user;
}

export async function updatePassword(id, currentPassword, newPassword) {
  const user = await User.findById(id);
  if (!user) throw new HttpErrors.NotFound("User not found");
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new HttpErrors.BadRequest("Invalid password");
  if (user.firstLogin === true) {
      user.firstLogin = false;
      await user.save();
  }
  user.password = await bcrypt.hash(newPassword, 10);
  return user.save();
}
export async function createAppSumoPlan(user, data) {
  const updatedUser = await User.findByIdAndUpdate(user.id, {
    appSumoCode: data?.coupon?.code,
    assignedPlan: data?.coupon?.priceId,
  });
  await deleteCoupon(data?.coupon?.code);
  return updatedUser;
}

export const fetchUsersInLast14Days = async () => {
  try {
    const currentDate = moment();
    const fourteenDaysAgo = moment().subtract(14, "days");

    const users = await User.find({
      createdAt: { $gte: fourteenDaysAgo.toDate(), $lte: currentDate.toDate() },
      $or: [
        { assignedPlan: null },
        { assignedPlan: { $exists: false } },
        { isAppSumoRefund: true },
        { isAppSumoRefund: { $exists: false} }
      ]
    });

    return users;
  } catch (error) {
    // console.error("Error fetching users:", error);
  }
};

export async function deleteUser(req) {
  const {
    userId
  } = req.body;
  const user = await User.findById(userId);
  if (user?._id && user?.email) {
    await UserPlan.deleteOne({ user });
    await PlanUsage.deleteOne({ user });
    await Productlicence.deleteOne({ activation_email: user.email });
    await User.findByIdAndDelete(user?._id);
    return { message: "User deleted successfully!" }
  } else {
    return { message: "User not present!" }
  }
}
