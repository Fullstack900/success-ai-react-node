import bcrypt from "bcrypt";
import qrcode from "qrcode";
import { authenticator } from "otplib";
import HttpErrors from "http-errors";
import crypto from "crypto";
import * as mailerService from "../mailer/mailer.service.js";
import * as userService from "../user/user.service.js";
import * as tokenService from "../token/token.service.js";
import * as intercomService from "../intercom/intercom.service.js";
import * as billingService from "../billing/billing.service.js"
import {
  checkIsValidCoupon,
  checkIsValidLicence,
} from "../appsumo/appsumo.service.js";
import User from "../user/models/user.model.js";
import UserPlan from "../billing/models/user-plan.model.js";


export async function register(userDetails) {
  const { email, password, sumo } = userDetails;
  const normalizedEmail = email.toLowerCase();

  const emailExists = await userService.findOne({ email: normalizedEmail });
  if (emailExists) throw new HttpErrors.BadRequest("Email already exists");
  userDetails.password = await bcrypt.hash(password, 10);
  userDetails.warmupTag = crypto.randomBytes(4).toString("hex").toUpperCase();
  userDetails.lastLogout = new Date();
  let { user, stripeCustomerId } = await userService.create({...userDetails, email: normalizedEmail});
  intercomService.createUser(user,null);
  const authToken = tokenService.generateAuthToken(user._id, user.warmupTag);
  if (user.firstLogin === true) {
    user.firstLogin = false;
    // console.log("user.firstLogin",user.firstLogin);
    await user.save();
}
  return { authToken, stripeCustomerId };
}

export async function validateSumoUser(userDetails) {
  const { password, licence } = userDetails;
  const isValid = await checkIsValidLicence(licence);
  if (isValid?.error) {
    throw new HttpErrors.BadRequest(isValid?.errorMessage);
  }
  const emailExists = await userService.findOne({
    email: isValid?.data?.activation_email?.toLowerCase(),
  });
  if (emailExists) throw new HttpErrors.BadRequest("Email already exists");
  userDetails.password = await bcrypt.hash(password, 10);
  userDetails.warmupTag = crypto.randomBytes(4).toString("hex").toUpperCase();
  userDetails.email = isValid?.data?.activation_email?.toLowerCase();
  userDetails.lastLogout = new Date();
  let user = await userService.validateAndCreateUser(userDetails, isValid);
  intercomService.createUser(user, isValid);
  const authToken = tokenService.generateAuthToken(user._id, user.warmupTag);
  return authToken;
}

export async function verify(token, skipUpdate = false) {
  let userId;

  try {
    ({ userId } = tokenService.verifyLoginToken(token));
  } catch (e) {
    throw new HttpErrors.BadRequest("Invalid Token");
  }
  let user;
  if (!skipUpdate) {
    user = await userService.update(userId, { emailVerified: true });
    if (!user.isDeleted) {
      const intercomUser = await intercomService.findUserFromIntercom(
        user.email
      );
      const attribute = {
        id: intercomUser.id,
        customAttributes: {
          account_activated: true,
        },
      };

      const intercomEvent = {
        eventName: "Email verified",
        userId: user._id,
        id: user._id,
        email: user.email,
        metadata: {},
        createdAt: Math.round(Date.now() / 1000),
      };

      await intercomService.createIntercomAttribute(attribute);
      await intercomService.createIntercomEvent(intercomEvent);
    }
  } else {
    user = await userService.findOne({ _id: userId });
  }

  if (!!user.isDeleted) {
    throw new HttpErrors.BadRequest(
      "User is disabled please contact support team."
    );
  }

  const authToken = tokenService.generateAuthToken(user._id);
  return authToken;
}

export async function login({ email, password }) {
  const normalizedEmail = email?.toLowerCase();
  const user = await userService.findOne({ email: normalizedEmail });
  if (!user) throw new HttpErrors.Unauthorized("Invalid email or password");

  if (!!user.isDeleted) {
    throw new HttpErrors.BadRequest(
      "User is disabled please contact support team."
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new HttpErrors.Unauthorized("Invalid email or password");
  }

  // if (!user.emailVerified) {
  //   throw new HttpErrors.BadRequest('Email not verified');
  // }

  const authToken = tokenService.generateAuthToken(user._id, user.warmupTag);
  return {
    authToken: authToken,
    twofaEnabled: user?.twofaEnabled,
    email: user?.email,
  };
}

export function logout(user) {
  return userService.update(user._id, { lastLogout: new Date() });
}

export async function forgotPassword(email) {
  const user = await userService.findOne({ email });
  if (!user) throw new HttpErrors.NotFound("Email not found");
  if (!user.emailVerified)
    throw new HttpErrors.BadRequest("Email not verified");
  mailerService.sendForgotPasswordMail(user);
}

export async function resendVerify(email) {
  const user = await userService.findOne(email);
  if (!user) throw new HttpErrors.NotFound("Email not found");

  mailerService.sendEmailVerificationMail(user);
}

export async function resetPassword(userId, password) {
  const hash = await bcrypt.hash(password, 10);
  return userService.update(userId, { password: hash });
}

export async function generate2faSecret(email, disable2fa = null) {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (disable2fa) {
    user.twofaSecret = "";
    user.twofaEnabled = false;
    user.save();
    return { message: "2FA Disabled", twofaEnabled: user.twofaEnabled };
  } else {
    if (user.twofaEnabled) {
      return {
        message: "2FA already verified and enabled",
        twofaEnabled: user.twofaEnabled,
      };
    }

    const secret = authenticator.generateSecret();
    user.twofaSecret = secret;
    await user.save();
    const appName = "Success.ai";
    const qrImageDataUrl = await qrcode.toDataURL(
      authenticator.keyuri(normalizedEmail, appName, secret)
    );

    return {
      message: "2FA secret generation successful",
      secret: secret,
      qrImageDataUrl: qrImageDataUrl,
      twofaEnabled: user.twofaEnabled,
    };
  }
}

export async function verifyOtp(email, token) {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (user.twofaEnabled) {
    return {
      message: "2FA already verified and enabled",
      twofaEnabled: user.twofaEnabled,
    };
  }

  token = token.replace(/\s/g, "");
  if (!authenticator.check(token, user.twofaSecret)) {
    return {
      message: "OTP verification failed: Invalid token",
      twofaEnabled: user.twofaEnabled,
    };
  } else {
    user.twofaEnabled = true;
    await user.save();

    return {
      message: "OTP verification successful",
      twofaEnabled: user.twofaEnabled,
    };
  }
}

export async function verifyLoginOtp(email, token) {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  token = token.replace(/\s/g, "");
  if (!authenticator.check(token, user.twofaSecret)) {
    return {
      message: "OTP verification failed: Invalid token",
      status: false,
    };
  } else {
    return {
      message: "OTP verification successful",
      status: true,
    };
  }
}

export async function getUser(email) {
  try {
    const normalizedEmail = email?.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('User not found for email:', normalizedEmail);
      return null;
    }

    return user;
  } catch (error) {
    throw error; 
  }
}

export async function updateUser(id, newEmail) {
  try {
    const existingUserPromise = User.findById(id);
    const checkUserWithNewEmail = await User.findOne({email: newEmail});
    const planPromise = UserPlan.findOne({ user: id }).select('stripeCustomerId');

    const [existingUser, plan] = await Promise.all([existingUserPromise, planPromise]);

    if (!existingUser) {
      throw new HttpErrors.BadRequest("User not found with this id.");
    } else if (checkUserWithNewEmail && newEmail !== existingUser.email){
      throw new HttpErrors.BadRequest("Email already exists");
    }

    const oldEmail = existingUser.email;
    const intercomUser = await intercomService.findUserFromIntercom(oldEmail);
    existingUser.email = newEmail;

    const [updatedIntercom, updatedStripe, updatedUser] = await Promise.all([
      intercomService.updateIntercomEmail(intercomUser?.id, newEmail),
      billingService.updateUserEmail(plan.stripeCustomerId, newEmail),
      existingUser.save()
    ]);
    const stripeCustomerId = plan?.stripeCustomerId;
    return {updatedUser , stripeCustomerId};
  } catch (error) {
    throw error;
  }
}


