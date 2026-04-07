import api from './api';

const dashboardService = {
    getStats: async () => (await api.get('/dashboard/stats')).data,
    getCharts: async () => (await api.get('/dashboard/charts')).data,
    getActivities: async (limit = 8) => (await api.get(`/dashboard/activities/recent?limit=${limit}`)).data,
    getActiveGroups: async () => (await api.get('/groups/active')).data,
    getUpcomingPayments: async () => (await api.get('/transactions/upcoming')).data,
    getRecentTransactions: async (limit = 8) => (await api.get(`/transactions/recent?limit=${limit}`)).data,
};

export default dashboardService;
