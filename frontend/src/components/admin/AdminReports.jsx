import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    Typography,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    Download as DownloadIcon,
    Analytics as AnalyticsIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const REPORT_TYPES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('monthly');
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalGroups: 0,
        totalTransactions: 0,
        revenue: 0,
    });
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetchReports();
    }, [reportType]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/reports', { params: { period: reportType } });
            const data = response.data || {};
            setSummary({
                totalUsers: data.total_users || 0,
                totalGroups: data.total_groups || 0,
                totalTransactions: data.total_transactions || 0,
                revenue: data.revenue || 0,
            });
            setReports(data.items || []);
        } catch (error) {
            setSummary({ totalUsers: 0, totalGroups: 0, totalTransactions: 0, revenue: 0 });
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csvRows = [
            ['Title', 'Description', 'Metric', 'Value'],
            ...reports.map((report) => [
                report.title || '',
                report.description || '',
                report.metric || '',
                report.value || '',
            ]),
        ];
        const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `digitequb-reports-${reportType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const chartData = [
        { label: 'Users', value: summary.totalUsers },
        { label: 'Groups', value: summary.totalGroups },
        { label: 'Transactions', value: summary.totalTransactions },
        { label: 'Revenue', value: summary.revenue },
    ];
    const maxValue = Math.max(...chartData.map((item) => item.value), 1);

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Reports
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Generate and review system analytics, transaction activity, and platform performance metrics.
                </Typography>
            </Box>

            <Card>
                <CardHeader
                    avatar={<AnalyticsIcon />}
                    title="Report Summary"
                    subheader="Quick overview for the selected period"
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Total Users</Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {summary.totalUsers.toLocaleString()}
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Total Groups</Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {summary.totalGroups.toLocaleString()}
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Transactions</Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {summary.totalTransactions.toLocaleString()}
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Revenue</Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        ETB {summary.revenue.toLocaleString()}
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardHeader avatar={<AccessTimeIcon />} title="Performance Chart" subheader="Visual progress for the current period" />
                <CardContent>
                    <Stack spacing={2}>
                        {chartData.map((item) => {
                            const percent = Math.round((item.value / maxValue) * 100);
                            return (
                                <Box key={item.label}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle2">{item.label}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {item.value.toLocaleString()}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ background: '#e0e0e0', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                                        <Box sx={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #1976d2, #42a5f5)' }} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Report Type"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                variant="outlined"
                            >
                                {REPORT_TYPES.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                            >
                                Export Report
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardHeader avatar={<BarChartIcon />} title="Report Details" />
                <Divider />
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Metric</TableCell>
                                        <TableCell align="right">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.length > 0 ? reports.map((report) => (
                                        <TableRow key={report.id || report.title} hover>
                                            <TableCell>{report.title}</TableCell>
                                            <TableCell>{report.description}</TableCell>
                                            <TableCell>{report.metric}</TableCell>
                                            <TableCell align="right">{report.value}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No report items found for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
};

export default AdminReports;
