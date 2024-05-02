import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "src/config.js";
import { getAuthToken } from "src/services/auth-service.js";

export const baseQuery = fetchBaseQuery({
  baseUrl: config.API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
