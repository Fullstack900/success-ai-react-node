import * as userService from "./user.service.js";

export function userDetails(req, res) {
  res.send(req.user);
}

export async function allReplyEmails(req, res) {
  const user = await userService.getAllReplyEmails(req.user._id);
  res.send({ message: "List of User Emails", emails: user });
}

export async function update(req, res) {
  const user = await userService.update(req.user._id, req.body);
  res.send({ message: "Successfully updated", user });
}

export async function sendEmailVerifyCode(req, res) {
  const { email } = req.body;
  await userService.sendEmailVerifyCode(email);
  res.send({ message: "Code sent" });
}
export async function sendVerificationCode(req, res) {
  const { email } = req.body;
  await userService.sendVerificationCode(email, req.user);
  res.send({ message: "Code sent" });
}

export async function verifyReplyEmailCode(req, res) {
  const { code } = req.body;
  await userService.verifyReplyEmailCode(code);
  res.send({ message: "Verified Email" });
}

export async function updateEmail(req, res) {
  const { code, email } = req.body;
  const user = await userService.updateEmail(req.user._id, code, email);
  res.send({ message: "Email updated", user });
}

export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  await userService.updatePassword(req.user._id, currentPassword, newPassword);
  res.send({ message: "Password updated" });
}
