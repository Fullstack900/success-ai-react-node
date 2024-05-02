import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";
import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: [],
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => {
        return {
          url: "users/me",
        };
      },
    }),
    updateUser: builder.mutation({
      query: (data) => {
        return {
          method: "PUT",
          url: "users/me",
          body: data,
        };
      },
    }),
    sendEmailVerifyCode: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "users/me/send-email-verify-code",
          body: data,
        };
      },
    }),
    sendEmailReplyVerificationCode: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "users/me/send-reply-email-verification",
          body: data,
        };
      },
    }),
    verifyReplyEmailCode: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "users/me/verify-email-code",
          body: data,
        };
      },
    }),
    getAllReplyEmails: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "users/me/all-reply-emails",
          body: data,
        };
      },
    }),
    updateEmail: builder.mutation({
      query: (data) => {
        return {
          method: "PUT",
          url: "users/me/email",
          body: data,
        };
      },
    }),
    updatePassword: builder.mutation({
      query: (data) => {
        return {
          method: "PUT",
          url: "users/me/password",
          body: data,
        };
      },
    }),
    getSignedUrl: builder.mutation({
      query: (data) => {
        return {
          headers: {
            "Content-Type": undefined,
          },
          method: "POST",
          url: "users/upload/image",
          body: data,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetMeQuery,
  useUpdateUserMutation,
  useSendEmailVerifyCodeMutation,
  useSendEmailReplyVerificationCodeMutation,
  useVerifyReplyEmailCodeMutation,
  useGetAllReplyEmailsMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useGetSignedUrlMutation,
} = userApi;
