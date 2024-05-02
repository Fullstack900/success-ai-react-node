import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";

// Define a service using a base URL and expected endpoints
export const tfaApi = createApi({
  reducerPath: "tfaApi",
  tagTypes: ["TFA"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    sendCode: builder.mutation({
      query: () => {
        return {
          method: "POST",
          url: "tfa/send-code",
        };
      },
    }),
    verifyCode: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "tfa/verify-code",
          body: data,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useSendCodeMutation, useVerifyCodeMutation } = tfaApi;
