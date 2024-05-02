import jwtDecode from "jwt-decode";
import { getAuthToken } from "src/services/auth-service.js";

export default function isLoggedIn() {
  const authToken = getAuthToken();
  return authToken && !isJwtExpired(authToken);
}

function isJwtExpired(token) {
  if (typeof token !== "string" || !token) throw new Error("Invalid token provided");

  let isJwtexpired = false;
  const { exp } = jwtDecode(token);
  const currentTime = new Date().getTime() / 1000;

  if (currentTime > exp) isJwtexpired = true;

  return isJwtexpired;
}
