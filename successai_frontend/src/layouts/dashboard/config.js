import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import DocumentTextIcon from "@heroicons/react/24/solid/DocumentTextIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon";
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import { SvgIcon } from "@mui/material";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import {
  ContactSupport,
  ContactSupportOutlined,
  Email,
  HelpOutline,
  Interests,
  InterestsOutlined,
  Inventory,
  Send,
  SendOutlined,
  Timeline,
} from "@mui/icons-material";
import { SBSearch } from "src/assets/sidebar/SBSearch";
import { SBEmail } from "src/assets/sidebar/SBEmail";
import { SBSend } from "src/assets/sidebar/SBSend";
import { SBChart } from "src/assets/sidebar/SBChart";
import { SBInbox } from "src/assets/sidebar/SBInbox";
import { SBSettings } from "src/assets/sidebar/SBSettings";
import { SBIntegration } from "src/assets/sidebar/SBIntegration";
import { SBSupport } from "src/assets/sidebar/SBSupport";

export const items = [
  {
    id: "Lead Finder",
    href: "/leadFinder",
    icon: (active) => (
      <SvgIcon>
        <SBSearch color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Lead Finder",
  },
  {
    id: "Email Accounts",
    href: "/accounts",
    icon: (active) => (
      <SvgIcon>
        <SBEmail color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Email Accounts",
  },
  {
    id: "Campaigns",
    href: "/campaigns",
    icon: (active) => (
      <SvgIcon>
        <SBSend color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Campaigns",
  },
  {
    id: "Analytics",
    href: "/analytics",
    icon: (active) => (
      <SvgIcon>
        <SBChart color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Analytics",
  },

  {
    id: "InboxHub",
    href: "/inboxhub",
    icon: (active) => (
      <SvgIcon>
        <SBInbox color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "InboxHub",
  },
  {
    id: "Settings",
    href: "/settings/billing",
    icon: (active) => (
      <SvgIcon>
        <SBSettings color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Settings",
  },
  {
    id: "Integrations",
    href: "/integrations",
    icon: (active) => (
      <SvgIcon>
        <SBIntegration color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Integrations",
  },
  {
    id: "Support Center",
    href: "/support",
    icon: (active) => (
      <SvgIcon>
        <SBSupport color={active ? "#FFFFFF" : "#FFFFFF"} />
      </SvgIcon>
    ),
    label: "Support Center",
  },

  // {
  //   href: "/",
  //   icon: (
  //     <SvgIcon>
  //       <ChartPieIcon />
  //     </SvgIcon>
  //   ),
  //   label: "Home",
  // },
  // {
  //   href: "/orders",
  //   icon: (
  //     <SvgIcon>
  //       <ShoppingCartIcon />
  //     </SvgIcon>
  //   ),
  //   label: "Orders",
  // },

  // {
  //   href: "/theme",
  //   icon: (
  //     <SvgIcon>
  //       <DocumentTextIcon />
  //     </SvgIcon>
  //   ),
  //   label: "Theme",
  // },
  // {
  //   href: "/icons",
  //   icon: (
  //     <SvgIcon>
  //       <StarIcon />
  //     </SvgIcon>
  //   ),
  //   label: "Icons",
  // },
  // {
  //   href: "/404",
  //   icon: (
  //     <SvgIcon>
  //       <ExclamationTriangleIcon />
  //     </SvgIcon>
  //   ),
  //   label: "Error",
  // },
];
