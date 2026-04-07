import React, { useState, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Typography,
    Box,
    Avatar,
    AvatarGroup,
    Button,
    IconButton,
    Chip,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Rating,
    Stack,
    Divider,
    Badge,
    Collapse,
    Grid,
    Paper,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    useTheme,
    alpha,
    Fade,
    Grow,
    Zoom,
    Skeleton
} from '@mui/material';
import {
    People as PeopleIcon,
    GroupAdd as GroupAddIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    ExitToApp as ExitToAppIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    LocationOn as LocationOnIcon,
    CalendarToday as CalendarTodayIcon,
    Description as DescriptionIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Link as LinkIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    WhatsApp as WhatsAppIcon,
    ContentCopy as ContentCopyIcon,
    Flag as FlagIcon,
    Report as ReportIcon,
    Block as BlockIcon,
    Verified as VerifiedIcon,
    Security as SecurityIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Comment as CommentIcon,
    Share as ShareOutlinedIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

// Styled components
const StyledCard = styled(Card)(({ theme, variant }) => ({
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    ...(variant === 'featured' && {
        border: `2px solid ${theme.palette.primary.main}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    }),
    ...(variant === 'compact' && {
        borderRadius: theme.spacing(1.5),
    }),
}));

const GroupAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
    width: 64,
    height: 64,
    backgroundColor: bgcolor || theme.palette.primary.main,
    borderRadius: theme.spacing(2),
    fontSize: '2rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        width: 12,
        height: 12,
        borderRadius: '50%',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
}));

const CoverImage = styled(Box)(({ theme, image }) => ({
    height: 120,
    backgroundImage: image ? `url(${image})` : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease',
}));

// Group types with colors and icons
const groupTypes = {
    project: { label: 'Project', color: '#1976d2', icon: '📁', bgColor: '#e3f2fd' },
    department: { label: 'Department', color: '#2e7d32', icon: '🏢', bgColor: '#e8f5e9' },
    team: { label: 'Team', color: '#ed6c02', icon: '👥', bgColor: '#fff3e0' },
    committee: { label: 'Committee', color: '#9c27b0', icon: '📋', bgColor: '#f3e5f5' },
    social: { label: 'Social', color: '#d81b60', icon: '🎉', bgColor: '#fce4ec' },
    learning: { label: 'Learning', color: '#0288d1', icon: '📚', bgColor: '#e1f5fe' },
    support: { label: 'Support', color: '#388e3c', icon: '🤝', bgColor: '#e8f5e9' },
};

const GroupCard = ({
    group,
    variant = 'standard', // standard, compact, featured, minimal
    onJoin,
    onLeave,
    onShare,
    onSave,
    onViewDetails,
    onReport,
    isMember = false,
    isSaved = false,
    showActions = true,
    showStats = true,
    showTags = true,
    showMembers = true,
    showDescription = true,
    interactive = true,
    loading = false
}) => {
    const theme = useTheme();

    // State
    const [anchorEl, setAnchorEl] = useState(null);
    const [openJoinDialog, setOpenJoinDialog] = useState(false);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [reportReason, setReportReason] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(group?.likeCount || 0);

    // Get group type info
    const typeInfo = useMemo(() => {
        if (!group?.type) return groupTypes.team;
        return groupTypes[group.type] || groupTypes.team;
    }, [group?.type]);

    // Calculate member progress
    const memberProgress = useMemo(() => {
        if (!group?.maxMembers) return null;
        return (group.memberCount / group.maxMembers) * 100;
    }, [group?.memberCount, group?.maxMembers]);

    // Format member count
    const formatMemberCount = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const days = differenceInDays(new Date(), new Date(date));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    // Handle join
    const handleJoin = async () => {
        setIsJoining(true);
        try {
            if (onJoin) {
                await onJoin(group.id);
            }
            showSnackbar(`You joined ${group.name}!`, 'success');
            setOpenJoinDialog(false);
        } catch (error) {
            showSnackbar('Failed to join group', 'error');
        } finally {
            setIsJoining(false);
        }
    };

    // Handle leave
    const handleLeave = async () => {
        setIsLeaving(true);
        try {
            if (onLeave) {
                await onLeave(group.id);
            }
            showSnackbar(`You left ${group.name}`, 'info');
            setOpenLeaveDialog(false);
        } catch (error) {
            showSnackbar('Failed to leave group', 'error');
        } finally {
            setIsLeaving(false);
        }
    };

    // Handle share
    const handleShare = async (platform) => {
        const shareUrl = window.location.href;
        const shareText = `Check out ${group.name} on our platform!`;

        let shareLink = '';
        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(group.name)}`;
                break;
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
                break;
            default:
                try {
                    await navigator.share({
                        title: group.name,
                        text: shareText,
                        url: shareUrl,
                    });
                } catch (err) {
                    navigator.clipboard.writeText(shareUrl);
                    showSnackbar('Link copied to clipboard!', 'success');
                }
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'noopener,noreferrer');
        }

        if (onShare) onShare(group.id);
        setOpenShareDialog(false);
        showSnackbar('Shared successfully!', 'success');
    };

    // Handle save
    const handleSave = () => {
        if (onSave) {
            onSave(group.id, !isSaved);
        }
        showSnackbar(isSaved ? 'Removed from saved' : 'Saved to your groups', 'success');
    };

    // Handle like
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    // Handle report
    const handleReport = () => {
        if (onReport) {
            onReport(group.id, reportReason);
        }
        showSnackbar('Report submitted successfully', 'success');
        setOpenReportDialog(false);
        setReportReason('');
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Handle menu open
    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Loading state
    if (loading) {
        return (
            <StyledCard variant={variant}>
                <Skeleton variant="rectangular" height={120} />
                <CardContent>
                    <Skeleton variant="circular" width={64} height={64} sx={{ mt: -4, mb: 2 }} />
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
                </CardContent>
            </StyledCard>
        );
    }

    // Minimal variant
    if (variant === 'minimal') {
        return (
            <StyledCard variant="minimal" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <GroupAvatar bgcolor={typeInfo.color} sx={{ width: 48, height: 48 }}>
                        {typeInfo.icon}
                    </GroupAvatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {group.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                                {formatMemberCount(group.memberCount)} members
                            </Typography>
                        </Stack>
                    </Box>
                    {showActions && (
                        <Button
                            size="small"
                            variant={isMember ? "outlined" : "contained"}
                            onClick={() => isMember ? setOpenLeaveDialog(true) : setOpenJoinDialog(true)}
                        >
                            {isMember ? 'Joined' : 'Join'}
                        </Button>
                    )}
                </Stack>
            </StyledCard>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={interactive ? { y: -4 } : {}}
            >
                <StyledCard variant={variant}>
                    {/* Cover Image */}
                    <CoverImage image={group.coverImage}>
                        {group.isVerified && (
                            <Tooltip title="Verified Group">
                                <VerifiedIcon
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        color: 'primary.main',
                                        bgcolor: 'background.paper',
                                        borderRadius: '50%',
                                        fontSize: 20,
                                    }}
                                />
                            </Tooltip>
                        )}
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </CoverImage>

                    {/* Avatar */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4, mb: 1 }}>
                        <StatusBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                group.isActive ? (
                                    <Tooltip title="Active">
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Inactive">
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                    </Tooltip>
                                )
                            }
                        >
                            <GroupAvatar bgcolor={typeInfo.color}>
                                {group.avatar ? (
                                    <img src={group.avatar} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    typeInfo.icon
                                )}
                            </GroupAvatar>
                        </StatusBadge>
                    </Box>

                    <CardContent sx={{ flex: 1, pt: 1 }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography
                                variant={variant === 'compact' ? 'subtitle1' : 'h6'}
                                component="h3"
                                fontWeight={700}
                                gutterBottom
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {group.name}
                                {group.isVerified && (
                                    <Tooltip title="Verified Group">
                                        <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                    </Tooltip>
                                )}
                            </Typography>

                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <Chip
                                    label={typeInfo.label}
                                    size="small"
                                    sx={{
                                        bgcolor: typeInfo.bgColor,
                                        color: typeInfo.color,
                                        fontWeight: 500,
                                    }}
                                />
                                {group.isPrivate && (
                                    <Chip
                                        label="Private"
                                        size="small"
                                        variant="outlined"
                                        icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                                    />
                                )}
                                {group.isFeatured && (
                                    <Chip
                                        label="Featured"
                                        size="small"
                                        color="warning"
                                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                                    />
                                )}
                            </Stack>
                        </Box>

                        {/* Description */}
                        {showDescription && group.description && (
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: showFullDescription ? 'unset' : 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {group.description}
                                </Typography>
                                {group.description.length > 100 && (
                                    <Button
                                        size="small"
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        sx={{ textTransform: 'none', mt: 0.5 }}
                                    >
                                        {showFullDescription ? 'Show less' : 'Read more'}
                                    </Button>
                                )}
                            </Box>
                        )}

                        {/* Stats */}
                        {showStats && (
                            <Stack spacing={1.5} sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PeopleIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {formatMemberCount(group.memberCount)} members
                                        </Typography>
                                    </Stack>
                                    {memberProgress !== null && (
                                        <Typography variant="caption" color="text.secondary">
                                            {Math.round(memberProgress)}% of limit
                                        </Typography>
                                    )}
                                </Stack>

                                {memberProgress !== null && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(memberProgress, 100)}
                                        sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            bgcolor: alpha(typeInfo.color, 0.2),
                                            '& .MuiLinearProgress-bar': { bgcolor: typeInfo.color },
                                        }}
                                    />
                                )}

                                {group.lastActive && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarTodayIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="text.secondary">
                                            Active {formatDate(group.lastActive)}
                                        </Typography>
                                    </Stack>
                                )}

                                {group.location && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOnIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="text.secondary">
                                            {group.location}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}

                        {/* Tags */}
                        {showTags && group.tags && group.tags.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {group.tags.slice(0, 3).map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    ))}
                                    {group.tags.length > 3 && (
                                        <Chip
                                            label={`+${group.tags.length - 3}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Members Preview */}
                        {showMembers && group.members && group.members.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Recent members
                                    </Typography>
                                    <Link
                                        component="button"
                                        variant="caption"
                                        onClick={() => onViewDetails && onViewDetails(group)}
                                    >
                                        View all
                                    </Link>
                                </Stack>
                                <AvatarGroup max={5} spacing="small">
                                    {group.members.map((member, index) => (
                                        <Tooltip key={index} title={member.name}>
                                            <Avatar
                                                src={member.avatar}
                                                sx={{ width: 28, height: 28 }}
                                            >
                                                {member.name?.charAt(0)}
                                            </Avatar>
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                            </Box>
                        )}

                        {/* Rating */}
                        {group.rating && (
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Rating value={group.rating} readOnly size="small" precision={0.5} />
                                    <Typography variant="caption" color="text.secondary">
                                        ({group.reviewCount || 0} reviews)
                                    </Typography>
                                </Stack>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        {showActions && (
                            <CardActions sx={{ p: 0, pt: 1, flexDirection: 'column', gap: 1 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            fullWidth
                                            variant={isMember ? "outlined" : "contained"}
                                            size="medium"
                                            startIcon={isMember ? <ExitToAppIcon /> : <GroupAddIcon />}
                                            onClick={() => isMember ? setOpenLeaveDialog(true) : setOpenJoinDialog(true)}
                                        >
                                            {isMember ? 'Joined' : 'Join'}
                                        </ActionButton>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            fullWidth
                                            variant="outlined"
                                            size="medium"
                                            startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            onClick={handleSave}
                                        >
                                            {isSaved ? 'Saved' : 'Save'}
                                        </ActionButton>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <IconButton
                                            size="small"
                                            onClick={handleLike}
                                            sx={{ color: isLiked ? 'error.main' : 'action.active' }}
                                        >
                                            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                {likeCount}
                                            </Typography>
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <IconButton size="small" onClick={() => onViewDetails && onViewDetails(group)}>
                                            <CommentIcon fontSize="small" />
                                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                {group.commentCount || 0}
                                            </Typography>
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <IconButton size="small" onClick={() => setOpenShareDialog(true)}>
                                            <ShareOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </CardActions>
                        )}
                    </CardContent>
                </StyledCard>
            </motion.div>

            {/* Join Dialog */}
            <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Join {group.name}
                    <IconButton
                        onClick={() => setOpenJoinDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        Are you sure you want to join this group? You'll be able to:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Connect with {group.memberCount} members" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Access exclusive content and discussions" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Participate in group events and activities" />
                        </ListItem>
                    </List>
                    {group.isPrivate && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This is a private group. Your request will be reviewed by group admins.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleJoin}
                        disabled={isJoining}
                        startIcon={isJoining ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    >
                        {isJoining ? 'Joining...' : 'Join Group'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Leave Dialog */}
            <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Leave {group.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        Are you sure you want to leave this group? You will lose access to:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Group content and discussions" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Upcoming events and notifications" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Connection with group members" />
                        </ListItem>
                    </List>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        You can rejoin later if the group is public.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleLeave}
                        disabled={isLeaving}
                        startIcon={isLeaving ? <CircularProgress size={20} /> : <ExitToAppIcon />}
                    >
                        {isLeaving ? 'Leaving...' : 'Leave Group'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Share {group.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FacebookIcon />}
                                onClick={() => handleShare('facebook')}
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Facebook
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<TwitterIcon />}
                                onClick={() => handleShare('twitter')}
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Twitter
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<LinkedInIcon />}
                                onClick={() => handleShare('linkedin')}
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                LinkedIn
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<WhatsAppIcon />}
                                onClick={() => handleShare('whatsapp')}
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                WhatsApp
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<LinkIcon />}
                                onClick={() => handleShare('copy')}
                            >
                                Copy Link
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>

            {/* Report Dialog */}
            <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Report {group.name}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Reason for reporting"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Please describe why you're reporting this group..."
                        sx={{ mt: 2 }}
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Your report will be reviewed by our moderation team.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReport}
                        disabled={!reportReason}
                    >
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => {
                    onViewDetails && onViewDetails(group);
                    handleMenuClose();
                }}>
                    <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setOpenShareDialog(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Share Group</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    setOpenReportDialog(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Report Group</ListItemText>
                </MenuItem>
            </Menu>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default GroupCard;