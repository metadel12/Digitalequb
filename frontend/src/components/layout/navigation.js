import {
    AddCircleOutline as CreateGroupIcon,
    CreditScore as CreditScoreIcon,
    AccountBalanceWallet as WalletIcon,
    Dashboard as DashboardIcon,
    NotificationsNone as NotificationsIcon,
    PeopleAltOutlined as GroupsIcon,
    ReceiptLong as TransactionsIcon,
    SettingsOutlined as SettingsIcon,
    AdminPanelSettingsOutlined as AdminIcon,
    PersonOutline as ProfileIcon,
} from '@mui/icons-material';

export const primaryNavigation = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: DashboardIcon,
        mobile: true,
    },
    {
        label: 'Groups',
        path: '/groups',
        icon: GroupsIcon,
        mobile: true,
    },
    {
        label: 'Create Group',
        path: '/create-group',
        icon: CreateGroupIcon,
    },
    {
        label: 'Transactions',
        path: '/transactions',
        icon: TransactionsIcon,
    },
    {
        label: 'Wallet',
        path: '/wallet',
        icon: WalletIcon,
        mobile: true,
    },
    {
        label: 'Credit Score',
        path: '/credit-score',
        icon: CreditScoreIcon,
    },
    {
        label: 'Notifications',
        path: '/notifications',
        icon: NotificationsIcon,
        mobile: true,
    },
];

export const secondaryNavigation = [
    {
        label: 'Profile',
        path: '/profile',
        icon: ProfileIcon,
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: SettingsIcon,
        mobile: true,
    },
    {
        label: 'Admin',
        path: '/admin',
        icon: AdminIcon,
        roles: ['admin'],
    },
];

export const filterNavigationByRole = (items, user) =>
    items.filter((item) => !item.roles || item.roles.includes(user?.role));
