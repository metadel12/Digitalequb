import React from 'react';
import {
    AppBar,
    Avatar,
    Badge,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    Menu as MenuIcon,
    NotificationsNone as NotificationsIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const MobileNav = ({
    user,
    items = [],
    bottomItems = [],
    currentPath = '/',
    open = false,
    onOpen,
    onClose,
}) => {
    const theme = useTheme();
    const activeBottom = Math.max(0, bottomItems.findIndex((item) => currentPath === item.path || currentPath.startsWith(item.path)));

    return (
        <>
            <AppBar
                position="sticky"
                color="transparent"
                elevation={0}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    backdropFilter: 'blur(18px)',
                    bgcolor: alpha(theme.palette.background.paper, 0.88),
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton edge="start" onClick={onOpen} aria-label="Open menu">
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={800}>
                            DigiEqub
                        </Typography>
                    </Box>
                    <Badge color="primary" variant="dot">
                        <IconButton aria-label="Notifications">
                            <NotificationsIcon />
                        </IconButton>
                    </Badge>
                </Toolbar>
            </AppBar>

            <Drawer
                open={open}
                onClose={onClose}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: '86%', maxWidth: 340 },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={user?.avatar} sx={{ width: 46, height: 46 }}>
                            {user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} noWrap>{user?.name || 'Member'}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {user?.email || 'Welcome back'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Divider />

                <List sx={{ px: 2, py: 2 }}>
                    {items.map((item) => {
                        const active = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <ListItemButton
                                key={item.path}
                                component={RouterLink}
                                to={item.path}
                                onClick={onClose}
                                selected={active}
                                sx={{
                                    borderRadius: 3,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>

            <Box sx={{ display: { xs: 'block', md: 'none' }, height: 72 }} />

            <BottomNavigation
                showLabels
                value={activeBottom}
                sx={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: theme.zIndex.appBar,
                    display: { xs: 'flex', md: 'none' },
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                {bottomItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.label}
                            icon={<Icon />}
                            component={RouterLink}
                            to={item.path}
                        />
                    );
                })}
            </BottomNavigation>
        </>
    );
};

export default MobileNav;
