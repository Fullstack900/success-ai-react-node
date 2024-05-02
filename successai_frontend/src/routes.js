import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout as DashboardLayout } from "./layouts/dashboard/layout";
import IconsPage from "./pages/icons";
import NotFoundPage from "./pages/404";
import OrdersPage from "./pages/orders";
import SettingsPage from "./pages/settings";
import LeadsFinderPage from "./pages/leadsFinder.js";
import EmailAccountsPage from "./pages/emailAccounts.js";
import ConnectEmailPage from "./components/emailAccounts/connect.js";
import AddNewCampaignPage from "./components/campaigns/addNewCampaign.js";
import CampaignsPage from "./pages/campaigns.js";
import SupportPage from "./pages/support.js";
import TrialExpiredPage from "./components/settings/TrialExpiredPage.js";
import IntegrationsPage from "./pages/integrations.js";
import UniboxPage from "./pages/unibox.js";
import AnalyticsPage from "./pages/analytics.js";
import CampaignDetailsPage from "./pages/campaignDetails.js";
import ThemePage from "./pages/theme";
import LoginPage from "./pages/auth/login";
import TwoFaVerification from "./pages/auth/twoFaVerification";
import RegisterPage from "./pages/auth/register";
import ResetPassword from "./pages/auth/resetPassword";
import VerifyPage from "./pages/auth/verify.js";
import VerifyEmailAddressPage from "./components/auth/verifyEmailAddress.js";
import VerifyReplyEmail from "./components/auth/verifyReplyEmail";
import isLoggedIn from "./utils/is-logged-in.js";
import MicrosoftRedirect from "./pages/oauth/microsoftRedirect.js";
import GoogleRedirect from "./pages/oauth/googleRedirect.js";
import ThankYou from "./pages/thankyou";
import CrmPage from "./pages/crmPage.js";
import InboxCrm from "./pages/inboxCrm.js";
import Unsubscribe from "./pages/unsubscribe";
import AppsumoValidationPage from "./pages/auth/validateAppSumo";
import { removeAuthToken } from "./services/auth-service";
import AccountMessage from "./pages/oauth/accountMessage";
import LoginProtection from "./loginProtection";
const DashboardWrapper = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

const isValidateRoute = window.location.pathname === "/validate";
if (isValidateRoute && isLoggedIn()) {
  removeAuthToken();
  window.location.reload();
}

const PrivateRoute = () => (isLoggedIn() ? <Outlet /> : <Navigate to="/login" />);
const PublicRoute = () => (isLoggedIn() ? <Navigate to="/" /> : <Outlet />);

export const routes = (
  <Routes>
    <Route element={<PrivateRoute />}>
      <Route path="/" element={<DashboardWrapper />}>
        <Route path="/" element={<Navigate to="accounts" />} />
        <Route path="leadFinder" element={<LeadsFinderPage />} />
        <Route path="accounts" element={<EmailAccountsPage />} />
        <Route path="oauth/microsoft/redirect" element={<MicrosoftRedirect />} />
        <Route path="oauth/google/redirect" element={<GoogleRedirect />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="inboxhub" element={<UniboxPage />} />
        <Route path="crmPage" element={<CrmPage />} />
        <Route path="inboxCrm" element={<InboxCrm />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings/billing" element={<SettingsPage tab="billing" />} />
        <Route path="settings/profile" element={<SettingsPage tab="profile" />} />
        <Route path="settings/blocklist" element={<SettingsPage tab="blocklist" />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="theme" element={<ThemePage />} />
        <Route path="icons" element={<IconsPage />} />{" "}
        <Route path="accounts/connect" element={<ConnectEmailPage />} />
      </Route>
      <Route path="settings/expired" element={<TrialExpiredPage />} />

      <Route path="campaigns/create" element={<AddNewCampaignPage />} />
      <Route path="loginProtection" element={<LoginProtection />} />

    </Route>
    <Route element={<PublicRoute />}>
      <Route path="login" element={<LoginPage />} />
      <Route path="two-factor-authentication" element={<TwoFaVerification />} />
      <Route path="validate" element={<AppsumoValidationPage />} />
      <Route path="reset-password" element={<ResetPassword />} />
    </Route>
    <Route path="register/:email" element={<RegisterPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="register/verify-email" element={<VerifyEmailAddressPage />} />
    <Route path="verifyReplyEmail" element={<VerifyReplyEmail />} />
    <Route path="verify" element={<VerifyPage />} />
    <Route path="404" element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
    <Route path="thankyou" element={<ThankYou />} />
    <Route path="unsubscribe" element={<Unsubscribe />}></Route>
    <Route path="accountMessage/:messageData" element={<AccountMessage />} />
  </Routes>
);
