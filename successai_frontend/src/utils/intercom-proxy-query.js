import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "src/config.js";
import { getAuthToken } from "src/services/auth-service.js";
export const intercomProxy = fetchBaseQuery({
  baseUrl: config.INTERCOM_PROXY_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
