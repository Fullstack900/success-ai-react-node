import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";

// Define a service using a base URL and expected endpoints
export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQuery,
  tagTypes: ["SEARCHES"],
  endpoints: (builder) => ({
    findLeads: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "leads/find",
          body: data,
        };
      },
      invalidatesTags: ["SEARCHES"],
    }),
    findCompanies: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "leads/searchCompany",
          body: data,
        };
      },
      invalidatesTags: ["SEARCHES"],
    }),
    lookupLeads: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `leads/lookup`,
          body: data,
        };
      },
    }),
    getSearches: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/leads/searches",
        };
      },
      providesTags: ["SEARCHES"],
    }),
    getSuggestions: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/leads/suggestions",
          body: data
        };
      },
    }),
    getAllSavedSearches: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/leads/searches/saved",
        };
      },
      providesTags: ["SEARCHES_SAVED"],
    }),
    createSavedSearch: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "leads/searches/saved",
          body: data,
        };
      },
      invalidatesTags: ["SEARCHES"],
    }),
    updateSearch: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `leads/searches/${id}`,
          body: data,
        };
      },
      invalidatesTags: ["SEARCHES"],
    }),
    deleteSearch: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `leads/searches/${id}`,
        };
      },
      invalidatesTags: ["SEARCHES", "SEARCHES_SAVED"],
    }),
    addLeadsToCampaign: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: `leads/add-to-campaign`,
          body: data,
        };
      },
    }),
    getLeads: builder.query({
      query: (id) => {
        return {
          method: "GET",
          url: "/leads/" + id,
        };
      },
      providesTags: [`LEADS`],
    }),
    deleteLeads: builder.mutation({
      query: (data) => {
        return {
          method: "DELETE",
          url: "/leads",
          body: data,
        };
      },
    }),
    moveToCampaign: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "POST",
          url: `/leads/move-to-campaign/${id}`,
          body: data,
        };
      },
    }),
    updateLead: builder.mutation({
      query: ({ id, data }) => {
        return {
          method: "PUT",
          url: `/leads/${id}`,
          body: data,
        };
      },
      invalidatesTags: [`LEADS`],
    }),
    saveDownloadCsv: builder.mutation({
      query: ({ data }) => {
        return {
          method: "POST",
          url: `/leads/save/csv`,
          body: data,
        };
      },
    }),
    getLeadsUsage: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/leads/lead/usage",
        };
      },
      providesTags: [`LEADS_USAGE`],
    }),
    getSavedFiles: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/leads/saved/files",
        };
      },
      providesTags: [`LEADS_SAVED`],
    }),
    removeLeads: builder.mutation({
      query: (data) => {
        return {
          method: "DELETE",
          url: "/leads/email",
          body: data,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useFindLeadsMutation,
  useFindCompaniesMutation,
  useLookupLeadsMutation,
  useGetSearchesQuery,
  useLazyGetAllSavedSearchesQuery,
  useCreateSavedSearchMutation,
  useUpdateSearchMutation,
  useDeleteSearchMutation,
  useAddLeadsToCampaignMutation,
  useGetLeadsQuery,
  useDeleteLeadsMutation,
  useMoveToCampaignMutation,
  useUpdateLeadMutation,
  useGetLeadsUsageQuery,
  useSaveDownloadCsvMutation,
  useGetSavedFilesQuery,
  useRemoveLeadsMutation,
  useGetSuggestionsMutation,
} = leadsApi;
