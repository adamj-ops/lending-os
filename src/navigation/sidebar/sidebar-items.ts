import {
  IconShoppingBag,
  IconTruckDelivery,
  IconMail,
  IconMessageCircle,
  IconCalendar,
  IconLayoutKanban,
  IconReceipt,
  IconUsers,
  IconLock,
  IconFingerprint,
  IconExternalLink,
  IconLayoutDashboard,
  IconChartBar,
  IconCash,
  IconGauge,
  IconSchool,
  IconTrendingUp,
  IconShieldCheck,
  type Icon,
} from "@tabler/icons-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: Icon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: Icon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Overview",
    items: [
      {
        title: "Portfolio",
        url: "/dashboard/portfolio",
        icon: IconLayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Loan Management",
    items: [
      {
        title: "Loans",
        url: "/dashboard/loans",
        icon: IconReceipt,
      },
      {
        title: "Borrowers",
        url: "/dashboard/borrowers",
        icon: IconUsers,
      },
      {
        title: "Lenders",
        url: "/dashboard/lenders",
        icon: IconCash,
      },
      {
        title: "Funds",
        url: "/dashboard/funds",
        icon: IconTrendingUp,
        subItems: [
          {
            title: "All Funds",
            url: "/dashboard/funds",
          },
          {
            title: "Analytics",
            url: "/dashboard/funds/analytics",
          },
        ],
      },
      {
        title: "Properties",
        url: "/dashboard/properties",
        icon: IconShoppingBag,
      },
    ],
  },
  {
    id: 3,
    label: "Operations",
    items: [
      {
        title: "Payments",
        url: "/dashboard/coming-soon",
        icon: IconChartBar,
        comingSoon: true,
      },
      {
        title: "Draws",
        url: "/dashboard/coming-soon",
        icon: IconTruckDelivery,
        comingSoon: true,
      },
      {
        title: "Documents",
        url: "/dashboard/coming-soon",
        icon: IconMail,
        comingSoon: true,
      },
      {
        title: "Compliance",
        url: "/dashboard/compliance",
        icon: IconShieldCheck,
      },
    ],
  },
  {
    id: 4,
    label: "Settings",
    items: [
      {
        title: "Team",
        url: "/dashboard/coming-soon",
        icon: IconUsers,
        comingSoon: true,
      },
      {
        title: "Organization",
        url: "/dashboard/coming-soon",
        icon: IconLock,
        comingSoon: true,
      },
    ],
  },
];
