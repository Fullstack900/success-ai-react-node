import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { authApi, removeAuthToken } from "./services/auth-service.js";
import { userApi, userSlice } from "./services/user-service.js";
import { accountApi, accountsSlice } from "./services/account-service.js";
import { campaignsApi } from "./services/campaign-service.js";
import { tfaApi } from "./services/tfa-service.js";
import { dnsApi, dnsSlice } from "./services/dns-service.js";
import { billingApi } from "./services/billing-service.js";
import { leadsApi } from "./services/leads-service.js";
import { inboxHubApi, inboxHubSlice } from "./services/unibox-service.js";
import { intercom } from "./services/intercom-service.js";
import search from "./store/reducers/search.js"

export const rtkQueryErrorLogger = (api) => (next) => async (action) => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
  if (
    isRejectedWithValue(action) &&
    action.payload?.data?.error?.message === "Invalid auth token"
  ) {
    removeAuthToken();
    toast.error("Session expired!");
    window.location.reload();
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [userSlice.name]: userSlice.reducer,
    [tfaApi.reducerPath]: tfaApi.reducer,
    [intercom.reducerPath]: intercom.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [accountsSlice.name]: accountsSlice.reducer,
    [dnsApi.reducerPath]: dnsApi.reducer,
    [dnsSlice.name]: dnsSlice.reducer,
    [campaignsApi.reducerPath]: campaignsApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [inboxHubSlice.name]: inboxHubSlice.reducer,
    [inboxHubApi.reducerPath]: inboxHubApi.reducer,
    search: search
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(tfaApi.middleware)
      .concat(intercom.middleware)
      .concat(accountApi.middleware)
      .concat(dnsApi.middleware)
      .concat(campaignsApi.middleware)
      .concat(billingApi.middleware)
      .concat(leadsApi.middleware)
      .concat(inboxHubApi.middleware)
      .concat(rtkQueryErrorLogger),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
