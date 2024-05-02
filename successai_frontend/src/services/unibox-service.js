import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";
import _ from "lodash";
import { createSlice } from "@reduxjs/toolkit";

export const inboxHubSlice = createSlice({
  name: "inboxhub",
  initialState: {
    actualTotalCount: null,
  },
  reducers: {
    setCampaignEmail(state, action) {
      return action.payload;
    },
    setCampaignEmailReply(state, action) {
      return action.payload;
    },
    setActualTotalCount(state, action) {
      state.actualTotalCount = action.payload;
    },
  },
});

export const { setCampaignEmail, setCampaignEmailReply, setActualTotalCount } =
  inboxHubSlice.actions;

// Define a service using a base URL and expected endpoints
export const inboxHubApi = createApi({
  reducerPath: "inboxHubApi",
  tagTypes: ["Inboxhub"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getCampaignEmails: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: `unibox`,
          params,
        };
      },
    }),
    getCampaignEmailsReply: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: `unibox/getReplies`,
          params,
        };
      },
    }),
    sendReplyEmail: builder.mutation({
      query: ({ body }) => {
        return {
          method: "POST",
          url: `unibox/sendReplies`,
          body,
        };
      },
    }),
    sendForwardMail: builder.mutation({
      query: ({ body }) => {
        return {
          method: "POST",
          url: `unibox/sendForward`,
          body,
        };
      },
    }),
    deleteThread: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `unibox/${id}`,
        };
      },
    }),
    openedEmail: builder.mutation({
      query: ({ id, body }) => {
        return {
          method: "PUT",
          url: `unibox/${id}`,
          body,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetCampaignEmailsMutation,
  useGetCampaignEmailsReplyMutation,
  useSendReplyEmailMutation,
  useSendForwardMailMutation,
  useDeleteThreadMutation,
  useOpenedEmailMutation,
} = inboxHubApi;
