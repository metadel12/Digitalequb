// Basic usage
import useNotifications from './hooks/useNotifications';

function App() {
    const {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        dismissNotification,
        settings,
        updateSettings
    } = useNotifications();

    return (
        <div>
            <NotificationBadge count={unreadCount} onClick={() => setDrawerOpen(true)} />

            <Button onClick={() => addNotification({
                title: 'Payment Received',
                message: 'You received ETB 1,500',
                type: 'payment',
                priority: 3,
            })}>
                Send Test Notification
            </Button>

            <NotificationList
                notifications={notifications}
                onNotificationClick={(n) => console.log('Clicked:', n)}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
            />
        </div>
    );
}

// With real-time updates
function RealtimeNotifications() {
    const { notifications, addNotification, settings } = useNotifications({
        enableRealtime: true,
        enableSounds: true,
        soundFiles: {
            payment: '/sounds/cash.mp3',
            group: '/sounds/notification.mp3',
        },
    });

    return <NotificationList notifications={notifications} />;
}

// With grouping
function GroupedNotifications() {
    const { groupedNotifications, handleNotificationClick } = useNotifications({
        enableGrouping: true,
        groupingStrategy: 'byType',
    });

    return (
        <div>
            {Object.entries(groupedNotifications).map(([type, group]) => (
                <div key={type}>
                    <Typography variant="h6">{type}</Typography>
                    <Badge badgeContent={group.count} color="primary" />
                    {group.notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)}>
                            {n.title}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// With push notifications
function PushNotificationSetup() {
    const { requestPermission, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

    return (
        <div>
            <Button onClick={requestPermission}>Request Permission</Button>
            <Button onClick={subscribeToPush}>Enable Push</Button>
            <Button onClick={unsubscribeFromPush}>Disable Push</Button>
        </div>
    );
}

// Complete notification center
function NotificationCenter() {
    const {
        notifications,
        unreadCount,
        loading,
        stats,
        filter,
        setFilter,
        markAllAsRead,
        dismissAll,
        fetchNotifications,
        settings,
        updateSettings,
        requestDesktopPermission,
        setShowSettings,
        showSettings,
    } = useNotifications({
        maxNotifications: 200,
        autoDismiss: true,
        enableSounds: true,
        enablePagination: true,
        pageSize: 20,
    });

    return (
        <Paper sx={{ width: 400, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    Notifications
                    {unreadCount > 0 && (
                        <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1 }} />
                    )}
                </Typography>
                <Box>
                    <IconButton onClick={() => setShowSettings(true)}>
                        <SettingsIcon />
                    </IconButton>
                    <IconButton onClick={markAllAsRead}>
                        <DoneAllIcon />
                    </IconButton>
                    <IconButton onClick={dismissAll}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={() => fetchNotifications()}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant={filter.type === 'all' ? 'contained' : 'outlined'}
                        onClick={() => setFilter({ type: 'all' })}
                    >
                        All
                    </Button>
                    <Button
                        size="small"
                        variant={filter.type === 'payment' ? 'contained' : 'outlined'}
                        onClick={() => setFilter({ type: 'payment' })}
                    >
                        Payments
                    </Button>
                    <Button
                        size="small"
                        variant={filter.type === 'group' ? 'contained' : 'outlined'}
                        onClick={() => setFilter({ type: 'group' })}
                    >
                        Groups
                    </Button>
                </Stack>

                <TextField
                    size="small"
                    placeholder="Search notifications..."
                    value={filter.search}
                    onChange={(e) => setFilter({ search: e.target.value })}
                    fullWidth
                    sx={{ mt: 1 }}
                />
            </Box>

            {/* Stats */}
            <Box sx={{ p: 1, bgcolor: 'action.hover' }}>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Chip label={`Total: ${stats.total}`} size="small" />
                    <Chip label={`Unread: ${stats.unread}`} size="small" color="error" />
                    <Chip label={`Read: ${stats.read}`} size="small" />
                </Stack>
            </Box>

            {/* Notification List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography color="text.secondary">No notifications</Typography>
                    </Box>
                ) : (
                    <NotificationList notifications={notifications} />
                )}
            </Box>

            {/* Pagination */}
            {stats.total > 20 && (
                <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Pagination
                        count={Math.ceil(stats.total / 20)}
                        onChange={(e, p) => fetchNotifications(p)}
                        size="small"
                    />
                </Box>
            )}

            {/* Settings Dialog */}
            <NotificationSettings
                open={showSettings}
                settings={settings}
                onUpdate={updateSettings}
                onClose={() => setShowSettings(false)}
            />
        </Paper>
    );
}