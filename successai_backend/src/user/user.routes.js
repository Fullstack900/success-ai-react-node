import express from "express";
import * as userController from "./user.controller.js";
import auth from "../common/middleware/auth.middleware.js";
import multer from "multer";
import path from "path";
import {
  validateSendEmailVerifyCode,
  validateUpdate,
  validateUpdateEmail,
  validateUpdatePassword,
  validateReplyEmailCode,
} from "./user.validator.js";
import tfa from "../tfa/middleware/tfa.middleware.js";
import uploadImg from "../common/utils/uploadImg.js";

const router = express.Router();

router.get("/me", auth, userController.userDetails);
router.put("/me", [auth, validateUpdate], userController.update);
router.post(
  "/me/send-email-verify-code",
  [auth, tfa, validateSendEmailVerifyCode],
  userController.sendEmailVerifyCode
);

router.post(
  "/me/send-reply-email-verification",
  [auth, validateSendEmailVerifyCode],
  userController.sendVerificationCode
);
router.post(
  "/me/verify-email-code",
  [validateReplyEmailCode],
  userController.verifyReplyEmailCode
);

router.post("/me/all-reply-emails", auth, userController.allReplyEmails);
router.put(
  "/me/email",
  [auth, validateUpdateEmail],
  userController.updateEmail
);
router.put(
  "/me/password",
  [auth, validateUpdatePassword],
  userController.updatePassword
);

router.post("/upload/image", async (req, res) => {
  const signedUrl = await uploadImg(req);
  res.send({ message: "Signed Url Created", signedUrl });
});

export default router;
