import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";
import _ from "lodash";
import { createSlice } from "@reduxjs/toolkit";

export const accountsSlice = createSlice({
  name: "accounts",
  initialState: [],
  reducers: {
    setAccounts(state, action) {
      return action.payload;
    },
    accountsAdded(state, action) {
      state.push(...action.payload);
    },
    accountUpdated(state, action) {
      const updatedAccount = action.payload;
      const index = state.findIndex((a) => a._id === updatedAccount._id);
      if (index >= 0) {
        state[index] = { ...state[index], ...updatedAccount };
      }
    },
    accountDeleted(state, action) {
      const id = action.payload;
      return state.filter((a) => a._id !== id);
    },
    accountsDeleted(state, action) {
      const { deleteAll, ids } = action.payload;
      if (deleteAll) return [];
      return state.filter((a) => !ids.includes(a._id));
    },
  },
});

export const {
  setAccounts,
  accountsAdded,
  accountUpdated,
  accountDeleted,
  accountsDeleted,
} = accountsSlice.actions;

// Define a service using a base URL and expected endpoints
export const accountApi = createApi({
  reducerPath: "accountApi",
  tagTypes: ["Account"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    connectMicrosoftAccount: builder.mutation({
      query: ({ code, reconnect }) => {
        return {
          method: "POST",
          url: "accounts/microsoft",
          params: reconnect && { reconnect },
          body: { code },
        };
      },
    }),
    connectGoogleAccount: builder.mutation({
      query: ({reconnect, code}) => {
        return {
          method: "POST",
          url: "accounts/google",
          params: reconnect && { reconnect },
          body: code,
        };
      },
    }),
    connectGoogleImapSmtp: builder.mutation({
      query: ({ reconnect, data }) => {
        return {
          method: "POST",
          url: "accounts/google-imap-smtp",
          params: reconnect && { reconnect },
          body: data,
        };
      },
    }),
    connectCustomImapSmtpAccount: builder.mutation({
      query: ({ data, reconnect }) => {
        return {
          method: "POST",
          url: "accounts/custom-imap-smtp",
          params: reconnect && { reconnect },
          body: data,
        };
      },
    }),
    getAccounts: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: `accounts/me`,
          params,
        };
      },
    }),
    getAccount: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: `accounts/account`,
          params,
        };
      },
    }),
    updateAccount: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `accounts/${id}`,
          body: data,
        };
      },
    }),
    resumeAccount: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `accounts/${id}/resume`,
        };
      },
    }),
    pauseAccount: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `accounts/${id}/pause`,
        };
      },
    }),
    enableWarmup: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `accounts/${id}/warmup/enable`,
        };
      },
    }),
    pauseWarmup: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `accounts/${id}/warmup/pause`,
        };
      },
    }),
    bulkDelete: builder.mutation({
      query: (data) => {
        return {
          method: "DELETE",
          url: `accounts/bulk`,
          body: data,
        };
      },
    }),
    removeAccount: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `accounts/${id}`,
        };
      },
    }),
    testImap: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "accounts/test-imap",
          body: data,
        };
      },
    }),
    testSmtp: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "accounts/test-smtp",
          body: data,
        };
      },
    }),
    testSmtpImap: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "accounts/test-smtp-and-imap",
          body: data,
        };
      },
    }),
    addBlocklist : builder.mutation({
      query:({data})=> {
        return {
          method: "POST",
          url: "warmup/add-blocklist-emails",
          body: data,
        }
      },
      invalidatesTags : ["BLOCKLIST"]
    }),
    getBlocklist : builder.mutation({
      query:({params})=> {
        return {
          method: "GET",
          url: "warmup/get-blocklist-emails",
          params,
        }
      },
      providesTags: ["BLOCKLIST"],
    }),
    deleteBlocklist: builder.mutation({
      query : (lists) => {
        return {
          method : "DELETE",
          url : "warmup/delete-blocklist-emails",
          body : lists
        }
      },
      invalidatesTags : ["BLOCKLIST"]
    })
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useConnectMicrosoftAccountMutation,
  useConnectGoogleAccountMutation,
  useConnectGoogleImapSmtpMutation,
  useConnectCustomImapSmtpAccountMutation,
  useGetAccountsMutation,
  useGetAccountMutation,
  useUpdateAccountMutation,
  useResumeAccountMutation,
  usePauseAccountMutation,
  useEnableWarmupMutation,
  usePauseWarmupMutation,
  useBulkDeleteMutation,
  useRemoveAccountMutation,
  useTestImapMutation,
  useTestSmtpMutation,
  useTestSmtpImapMutation,
  useAddBlocklistMutation,
  useGetBlocklistMutation,
  useDeleteBlocklistMutation
} = accountApi;
