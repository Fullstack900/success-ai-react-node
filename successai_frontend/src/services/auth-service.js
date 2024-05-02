import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";

export const setAuthToken = (authToken) => localStorage.setItem("auth_token", authToken);
export const getAuthToken = () => localStorage.getItem("auth_token");
export const removeAuthToken = () => localStorage.removeItem("auth_token");

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: ["Auth"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => {
        return {
          url: "auth/register",
          method: "POST",
          body: data,
        };
      },
    }),
    validateAppSumo: builder.mutation({
      query: (data) => {
        return {
          url: "auth/verifyAppsumo",
          method: "POST",
          body: data,
        };
      },
    }),
    verify: builder.mutation({
      query: (data) => {
        return {
          url: "auth/verify",
          method: "POST",
          body: data,
        };
      },
    }),
    login: builder.mutation({
      query: (data) => {
        return {
          url: "auth/login",
          method: "POST",
          body: data,
        };
      },
    }),
    resendVerifyLink: builder.mutation({
      query: (data) => {
        return {
          url: "auth/resend-verify-link",
          method: "POST",
          body: data,
        };
      },
    }),
    logout: builder.mutation({
      query: () => {
        return {
          method: "POST",
          url: "auth/logout",
        };
      },
    }),
    forgotPassword: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "auth/forgot-password",
          body: data,
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "auth/reset-password",
          body: data,
        };
      },
    }),
    generateTwofaSecret: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "auth/generate-2fa-secret",
          body: data,
        };
      },
    }),
    verifyOtp: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "auth/verify-otp",
          body: data,
        };
      },
    }),
    getUser: builder.mutation({
      query: (email) => {
        return {
          method: "GET",
          url: `auth/user/${email}`,
          email,
        };
      },
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `auth/user/${id}`,
          body: data,
        };
      },
    }),
    verifyLoginOtp: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "auth/verify-login-otp",
          body: data,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRegisterMutation,
  useValidateAppSumoMutation,
  useVerifyMutation,
  useLoginMutation,
  useResendVerifyLinkMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useGenerateTwofaSecretMutation,
  useVerifyOtpMutation,
  useVerifyLoginOtpMutation,
  useResetPasswordMutation,
  useGetUserMutation,
  useUpdateUserMutation
} = authApi;
