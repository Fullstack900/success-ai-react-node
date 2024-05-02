import * as authService from "./auth.service.js";

export async function register(req, res) {
  const { authToken, stripeCustomerId } = await authService.register(req.body);
  res.send({ message: "Successfully Registered", authToken, stripeCustomerId });
}
export async function validateSumo(req, res) {
  const authToken = await authService.validateSumoUser(req.body);
  res.send({ message: "Successfully Registered", authToken });
}

export async function verify(req, res) {
  const { token, skipUpdate } = req.body;
  const authToken = await authService.verify(token, skipUpdate);
  res.send({ authToken });
}

export async function login(req, res) {
  const authToken = await authService.login(req.body);
  res.send({ message: "Logged In", authToken });
}

export async function logout(req, res) {
  await authService.logout(req.user);
  res.send({ message: "Logged Out" });
}

export async function resendVerify(req, res) {
  const email = req.body;
  await authService.resendVerify(email);
  res.send({ message: "Verification link send" });
}
export async function forgotPassword(req, res) {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.send({ message: "Reset password email sent!" });
}

export async function resetPassword(req, res) {
  const { newPassword } = req.body;
  await authService.resetPassword(req.user.id, newPassword);
  res.send({ message: "Password Reset" });
}

export async function generate2faSecret(req, res) {
  const { email, disable2fa } = req.body;
  const response = await authService.generate2faSecret(email, disable2fa);
  res.send({ message: response });
}

export async function verifyOtp(req, res) {
  const { email, token } = req.body;
  const response = await authService.verifyOtp(email, token);
  res.send({ message: response });
}

export async function verifyLoginOtp(req, res) {
  const { email, token } = req.body;
  const response = await authService.verifyLoginOtp(email, token);
  res.send({ message: response });
}

export async function updateUser(req, res) {
  const {updatedUser , stripeCustomerId} = await authService.updateUser(req.params.id, req.body.email);
  res.send({updatedUser, stripeCustomerId});
}

export async function getUser(req, res) {
  const email = req.params.email;
  const response = await authService.getUser(email);
  res.send(response);
}
