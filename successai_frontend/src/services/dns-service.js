import { createSlice } from "@reduxjs/toolkit";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";

export const dnsSlice = createSlice({
  name: "dns",
  initialState: {
    vitals: {},
  },
  reducers: {
    setDnsVitals(state, action) {
      state.vitals = action.payload;
    },
  },
});

export const { setDnsVitals } = dnsSlice.actions;

export const dnsApi = createApi({
  reducerPath: "dnsApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getDnsVitals: builder.mutation({
      query: (data) => {
        return {
          url: "dns/vitals",
          method: "POST",
          body: data,
        };
      },
      transformResponse: ({ dnsRecord }) => {
        const { failure_list, success_list } = dnsRecord;
        const records = {};
        failure_list.forEach((item) => (records[item.domain] = item));
        success_list.forEach((item) => (records[item.domain] = item));
        return {
          records,
          failureCount: failure_list.length,
          successCount: success_list.length,
        };
      },
    }),
    checkCname: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "dns/check_domain_dns",
          body: data,
        };
      },
    }),
    checkSsl: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "dns/check_domain_ssl",
          body: data,
        };
      },
    }),
  }),
});

export const { useGetDnsVitalsMutation, useCheckCnameMutation , useCheckSslMutation } = dnsApi;
