import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "src/utils/base-query.js";
import { intercomProxy } from "src/utils/intercom-proxy-query";

// Define a service using a base URL and expected endpoints
export const intercom = createApi({
  reducerPath: "intercom",
  tagTypes: ["INTERCOM"],
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    updateIntercom: builder.mutation({
      query: (data) => {
        return {
          method: "PUT",
          url: "intercom/update-intercom",
          body: data,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useUpdateIntercomMutation } = intercom;
