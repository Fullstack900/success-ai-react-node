import { createApi } from "@reduxjs/toolkit/query/react";
import { planNames } from "src/config";
import { baseQuery } from "src/utils/base-query.js";
import { daysLeftInFreeTrial, isFreeTrialExpired } from "src/utils/util";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getCurrentPlan: builder.query({
      query: () => {
        return {
          url: "billing/current-plan",
        };
      },
      transformResponse: (response) => {
        const appSumoUser =
          response.user.assignedPlan &&
          response.user.assignedPlan.length > 0 &&
          !response.user.isAppSumoRefund;

        const freeTrialExpired = appSumoUser
          ? false
          : isFreeTrialExpired(response?.plan?.freeTrialExpiresAt);
        const daysForFreeTrial = appSumoUser
          ? 0
          : freeTrialExpired
          ? daysLeftInFreeTrial(response?.plan?.freeTrialExpiresAt)
          : 0;

        window.Intercom("update", {
          subscription_plan:
            planNames[
              response.plan?.subscription?.sendingWarmup?.planId ||
                response.plan?.subscription?.leads?.planId
            ],
          trial_is_on: freeTrialExpired,
          trial_days_left: daysForFreeTrial,
          paid:
            response.plan?.subscription?.sendingWarmup?.active ||
            response.plan?.subscription?.leads?.active,
        });
        return response.plan;
      },

      providesTags: ["CURRENT_PLAN"],
    }),
    createCheckoutSession: builder.mutation({
      query: (data) => {
        return {
          url: "billing/checkout-session",
          method: "POST",
          body: data,
        };
      },
    }),
    updatePlan: builder.mutation({
      query: (data) => {
        return {
          url: "billing/update-plan",
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["INVOICE"],
    }),
    getPaymentMethod: builder.query({
      query: () => {
        return {
          url: "billing/payment-method",
          method: "GET",
        };
      },
    }),
    billingUsage: builder.query({
      query: () => {
        return {
          url: "billing/lead-credits",
          method: "GET",
        };
      },
      providesTags: ["CURRENT_USAGE"],
    }),
    updatePayment: builder.mutation({
      query: () => {
        return {
          url: "billing/create-portal-session",
          method: "POST",
        };
      },
      transformResponse: (response) => response.url,
    }),
    invoices: builder.query({
      query: () => {
        return {
          url: "billing/get-invoices",
          method: "GET",
        };
      },
      providesTags: ["INVOICE"],
    }),
  }),
});

export const {
  useGetCurrentPlanQuery,
  useCreateCheckoutSessionMutation,
  useUpdatePlanMutation,
  useGetPaymentMethodQuery,
  useUpdatePaymentMutation,
  useBillingUsageQuery,
  useInvoicesQuery,
} = billingApi;
