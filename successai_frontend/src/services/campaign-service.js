import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";
import _ from "lodash";

// Define a service using a base URL and expected endpoints
export const campaignsApi = createApi({
  reducerPath: "campaignsApi",
  tagTypes: ["CAMPAIGNS"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    createCampaign: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "campaigns",
          body: data,
        };
      },
      invalidatesTags: ["CAMPAIGNS"],
    }),
    getAccountAnalytics: builder.mutation({
      query: (params) => {
        return {
          method: "GET",
          url: "campaigns/analytics",
          params,
        };
      },
      invalidatesTags: ["ANALYTICS"],
    }),
    getCampaign: builder.query({
      query: (id) => {
        return {
          method: "GET",
          url: "campaigns/" + id,
        };
      },
      providesTags: (result, error, arg) => [`CAMPAIGN_${arg}`],
    }),
    getCampaignsPagination: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: "/campaigns",
          params,
        };
      },
      providesTags: ["CAMPAIGNS"],
    }),
    getCampaigns: builder.query({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: "/campaigns",
          params,
        };
      },
      providesTags: ["CAMPAIGNS"],
    }),
    getCampaignNames: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/campaigns/names",
        };
      },
    }),
    pauseCampaign: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `campaigns/${id}/pause`,
        };
      },
      invalidatesTags: (result, error, arg) => ["CAMPAIGNS", `CAMPAIGN_${arg}`],
    }),
    resumeCampaign: builder.mutation({
      query: (id) => {
        return {
          method: "PUT",
          url: `campaigns/${id}/resume`,
        };
      },
      invalidatesTags: (result, error, arg) => ["CAMPAIGNS", `CAMPAIGN_${arg}`],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `campaigns/${id}`,
          body: data,
        };
      },
      invalidatesTags: (result) => ["CAMPAIGNS", `CAMPAIGN_${result.campaign._id}`],
    }),
    deleteCampaign: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `campaigns/${id}`,
        };
      },
      invalidatesTags: ["CAMPAIGNS"],
    }),
    createCampaignSchedule: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "POST",
          url: `campaigns/${id}/schedules`,
          body: data,
        };
      },
      invalidatesTags: (result, error, arg) => [`CAMPAIGN_${arg.id}`],
    }),
    updateCampaignSchedule: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `campaigns/schedules/${id}`,
          body: data,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result?.schedule?.campaign}`],
    }),
    deleteCampaignSchedule: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `campaigns/schedules/${id}`,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result?.schedule?.campaign}`],
    }),
    writeEmail: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `campaigns/write_email`,
          body: data,
        };
      },
      transformResponse: (response) => response.body,
    }),
    optimizeEmail: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `campaigns/optimize_email`,
          body: data,
        };
      },
      transformResponse: (response) => response.body,
    }),
    updateConfigurations: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `campaigns/set/options`,
          body: data,
        };
      },
    }),
    updateTestAccount: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `campaigns/set/testOptions`,
          body: data,
        };
      },
    }),
    createLeads: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "POST",
          url: `campaigns/${id}/leads`,
          body: data,
        };
      },
    }),
    duplicateCheck: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "POST",
          url: `campaigns/${id}/duplicate/leads`,
          body: data,
        };
      },
    }),
    getLeads: builder.mutation({
      query: ({ id, params }) => {
        return {
          method: "GET",
          url: `campaigns/${id}/leads`,
          params,
        };
      },
    }),
    createSequence: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "POST",
          url: `campaigns/${id}/sequences`,
          body: data,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result.sequence.campaign}`],
    }),
    updateSequenceOrder: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `campaigns/${id}/sequences/order`,
          body: data,
        };
      },
      invalidatesTags: (result, error, arg) => [`CAMPAIGN_${arg.id}`],
    }),
    updateSequence: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `campaigns/sequences/${id}`,
          body: data,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result.sequence.campaign}`],
    }),
    copySequence: builder.mutation({
      query: (id) => {
        return {
          method: "POST",
          url: `campaigns/sequences/${id}/copy`,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result.sequence.campaign}`],
    }),
    deleteSequence: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `campaigns/sequences/${id}`,
        };
      },
      invalidatesTags: (result) => [`CAMPAIGN_${result.sequence.campaign}`],
    }),
    getCampaignVariables: builder.query({
      query: (id) => {
        return {
          method: "GET",
          url: `campaigns/get-variables/${id}`,
        };
      },
      transformResponse: (response) => response.variables,
    }),
    campaignLaunch: builder.mutation({
      query: ({id, params}) => {
        return {
          method: "POST",
          url: `campaigns/launch/${id}`,
          body: params,
        };
      },
    }),
    campaignAnalytics: builder.mutation({
      query: ({ id, params }) => {
        return {
          method: "GET",
          url: `campaigns/get_campaign_analytics/${id}`,
          params,
        };
      },
    }),
    renameCampaign: builder.mutation({
      query: ({ id, params }) => {
        return {
          method: "PUT",
          url: `campaigns/${id}`,
          body: params,
        };
      },
    }),
    campaignAnalyticsGraphData: builder.mutation({
      query: ({ id, params }) => {
        return {
          method: "GET",
          url: `campaigns/${id}/analytics`,
          params,
        };
      },
    }),
    analytics: builder.mutation({
      query: (queryParams) => {
        const params = new URLSearchParams(_.pickBy(queryParams));
        return {
          method: "GET",
          url: `campaigns/analytics/stats`,
          params,
        };
      },
      providesTags: ["ANALYTICS"],
    }),
    createLabel: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "campaigns/create/label",
          body: data,
        };
      },
    }),
    getAllLabels: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "campaigns/get/label",
        };
      },
    }),
    getEmailTemplates: builder.query({
      query: (id) => {
        return {
          method: "GET",
          url: `campaigns/get_templates/${id}`,
        };
      },
    }),
    updateLabel: builder.mutation({
      query: ({ campaignEmailId, labelId }) => {
        return {
          method: "PUT",
          url: `campaigns/updatelabel/${campaignEmailId}/${labelId}`,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateCampaignMutation,
  useGetAccountAnalyticsMutation,
  useGetCampaignQuery,
  useGetCampaignsQuery,
  useGetCampaignsPaginationMutation,
  useLazyGetCampaignNamesQuery,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useCreateLeadsMutation,
  useDuplicateCheckMutation,
  useGetLeadsMutation,
  useCreateCampaignScheduleMutation,
  useUpdateCampaignScheduleMutation,
  useDeleteCampaignScheduleMutation,
  useWriteEmailMutation,
  useUpdateConfigurationsMutation,
  useUpdateTestAccountMutation,
  useOptimizeEmailMutation,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useUpdateSequenceOrderMutation,
  useCopySequenceMutation,
  useDeleteSequenceMutation,
  useCampaignLaunchMutation,
  useGetCampaignVariablesQuery,
  useCampaignAnalyticsMutation,
  useCampaignAnalyticsGraphDataMutation,
  useAnalyticsMutation,
  useRenameCampaignMutation,
  useCreateLabelMutation,
  useGetAllLabelsQuery,
  useGetEmailTemplatesQuery,
  useUpdateLabelMutation,
} = campaignsApi;
