import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Collapse,
    Fade,
    Slide,
    Grow,
    Zoom,
    Alert,
    AlertTitle,
    Snackbar,
    LinearProgress,
    Stack,
    Avatar,
    Chip,
    Button,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    ReportProblem as ReportProblemIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Update as UpdateIcon,
    CloudUpload as CloudUploadIcon,
    CloudDownload as CloudDownloadIcon,
    Security as SecurityIcon,
    Schedule as ScheduleIcon,
    CopyAll as CopyAllIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Notifications as NotificationsIcon,
    Email as EmailIcon,
    Check as CheckIcon,
    Refresh as RefreshIcon,
    FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideInBottom = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Styled components
const ToastContainer = styled(Box)(({ theme, position }) => {
    const positions = {
        'top-left': { top: 16, left: 16, right: 'auto', bottom: 'auto' },
        'top-right': { top: 16, right: 16, left: 'auto', bottom: 'auto' },
        'bottom-left': { bottom: 16, left: 16, top: 'auto', right: 'auto' },
        'bottom-right': { bottom: 16, right: 16, top: 'auto', left: 'auto' },
        'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)', right: 'auto', bottom: 'auto' },
        'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)', top: 'auto', right: 'auto' },
    };

    return {
        position: 'fixed',
        zIndex: 9999,
        ...positions[position],
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: '90vw',
        width: '100%',
        pointerEvents: 'none',
        '& > *': {
            pointerEvents: 'auto',
        },
    };
});

const StyledPaper = styled(Paper)(({ theme, type, animation, progress }) => ({
    minWidth: 280,
    maxWidth: 450,
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    position: 'relative',
    boxShadow: theme.shadows[4],
    transition: 'all 0.3s ease',
    animation: `${animation} 0.3s ease-out`,
    '&:hover': {
        boxShadow: theme.shadows[8],
        transform: 'scale(1.02)',
    },
    ...(progress === 0 && {
        animation: `${fadeOut} 0.3s ease-out forwards`,
    }),
}));

const ProgressBar = styled(LinearProgress)(({ theme, type }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: alpha(theme.palette[type].main, 0.3),
    '& .MuiLinearProgress-bar': {
        backgroundColor: theme.palette[type].main,
    },
}));

const IconWrapper = styled(Box)(({ theme, type }) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(theme.palette[type].main, 0.1),
    color: theme.palette[type].main,
}));

// Toast types configuration
const toastTypes = {
    success: {
        icon: CheckCircleIcon,
        color: 'success',
        sound: 'success.mp3',
        defaultTitle: 'Success!',
        duration: 4000,
    },
    error: {
        icon: ErrorIcon,
        color: 'error',
        sound: 'error.mp3',
        defaultTitle: 'Error!',
        duration: 6000,
    },
    warning: {
        icon: WarningIcon,
        color: 'warning',
        sound: 'warning.mp3',
        defaultTitle: 'Warning!',
        duration: 5000,
    },
    info: {
        icon: InfoIcon,
        color: 'info',
        sound: 'info.mp3',
        defaultTitle: 'Info',
        duration: 3000,
    },
    loading: {
        icon: RefreshIcon,
        color: 'primary',
        sound: null,
        defaultTitle: 'Loading...',
        duration: null,
    },
};

// Custom Toast Component
const ToastItem = ({
    id,
    message,
    type = 'info',
    title,
    duration = 4000,
    onClose,
    position = 'top-right',
    animation = 'slideInRight',
    progress = true,
    actions = [],
    icon,
    sound = false,
    closable = true,
    pauseOnHover = true,
    showIcon = true,
    showProgress = true,
    variant = 'standard', // standard, filled, outlined
    size = 'medium', // small, medium, large
}) => {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [paused, setPaused] = useState(false);
    const [progressValue, setProgressValue] = useState(100);
    const timerRef = useRef(null);
    const progressRef = useRef(null);

    const toastType = toastTypes[type] || toastTypes.info;
    const ToastIcon = icon || toastType.icon;
    const toastColor = toastType.color;
    const toastTitle = title || toastType.defaultTitle;

    // Handle auto-close
    useEffect(() => {
        if (duration && !paused) {
            const startTime = Date.now();
            const endTime = startTime + duration;

            const updateProgress = () => {
                const now = Date.now();
                const remaining = endTime - now;
                const progressPercent = (remaining / duration) * 100;

                if (remaining <= 0) {
                    handleClose();
                } else {
                    setProgressValue(Math.max(0, progressPercent));
                    progressRef.current = requestAnimationFrame(updateProgress);
                }
            };

            progressRef.current = requestAnimationFrame(updateProgress);

            return () => {
                if (progressRef.current) {
                    cancelAnimationFrame(progressRef.current);
                }
            };
        }
    }, [duration, paused]);

    // Handle sound
    useEffect(() => {
        if (sound && type !== 'loading') {
            const audio = new Audio(`/sounds/${toastType.sound}`);
            audio.play().catch(() => {
                // Silently fail if sound can't be played
            });
        }
    }, [sound, type]);

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            onClose(id);
        }, 300);
    };

    const handleMouseEnter = () => {
        if (pauseOnHover && duration) {
            setPaused(true);
        }
    };

    const handleMouseLeave = () => {
        if (pauseOnHover && duration) {
            setPaused(false);
        }
    };

    // Get animation style
    const getAnimation = () => {
        switch (animation) {
            case 'slideInLeft': return slideInLeft;
            case 'slideInTop': return slideInTop;
            case 'slideInBottom': return slideInBottom;
            case 'zoom': return 'zoomIn';
            case 'fade': return 'fadeIn';
            default: return slideInRight;
        }
    };

    // Get size styles
    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { padding: '8px 12px', fontSize: '0.875rem' };
            case 'large':
                return { padding: '16px 20px', fontSize: '1rem' };
            default:
                return { padding: '12px 16px', fontSize: '0.9375rem' };
        }
    };

    // Get variant styles
    const getVariantStyles = () => {
        if (variant === 'filled') {
            return {
                backgroundColor: theme.palette[toastColor].main,
                color: theme.palette[toastColor].contrastText,
                '& .MuiTypography-root': {
                    color: theme.palette[toastColor].contrastText,
                },
            };
        }
        if (variant === 'outlined') {
            return {
                border: `1px solid ${theme.palette[toastColor].main}`,
                backgroundColor: theme.palette.background.paper,
            };
        }
        return {
            backgroundColor: theme.palette.background.paper,
            borderLeft: `4px solid ${theme.palette[toastColor].main}`,
        };
    };

    return (
        <Fade in={open} timeout={300}>
            <StyledPaper
                elevation={3}
                type={toastColor}
                animation={getAnimation()}
                progress={progressValue}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{
                    ...getVariantStyles(),
                    ...getSizeStyles(),
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {showIcon && (
                        <IconWrapper type={toastColor}>
                            <ToastIcon />
                        </IconWrapper>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {toastTitle && (
                            <Typography
                                variant={size === 'large' ? 'subtitle1' : 'subtitle2'}
                                fontWeight={600}
                                gutterBottom={!!message}
                                sx={{
                                    wordBreak: 'break-word',
                                    color: variant === 'filled' ? 'inherit' : 'text.primary',
                                }}
                            >
                                {toastTitle}
                            </Typography>
                        )}

                        {message && (
                            <Typography
                                variant="body2"
                                sx={{
                                    wordBreak: 'break-word',
                                    color: variant === 'filled' ? 'inherit' : 'text.secondary',
                                }}
                            >
                                {message}
                            </Typography>
                        )}

                        {actions && actions.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                {actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        size="small"
                                        variant={action.variant || 'text'}
                                        color={toastColor}
                                        onClick={() => {
                                            action.onClick();
                                            if (action.closeOnClick !== false) {
                                                handleClose();
                                            }
                                        }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {closable && (
                        <IconButton
                            size="small"
                            onClick={handleClose}
                            sx={{
                                mt: -0.5,
                                mr: -0.5,
                                color: variant === 'filled' ? 'inherit' : 'text.secondary',
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>

                {showProgress && duration && progressValue > 0 && (
                    <ProgressBar
                        variant="determinate"
                        value={progressValue}
                        type={toastColor}
                    />
                )}
            </StyledPaper>
        </Fade>
    );
};

// Main Toast Container Component
const Toast = ({
    toasts = [],
    position = 'top-right',
    maxToasts = 5,
    onClose,
    animation = 'slideInRight',
    pauseOnHover = true,
    showProgress = true,
    showIcon = true,
    variant = 'standard',
    size = 'medium',
    stackMode = 'stack', // stack, queue, replace
}) => {
    const displayedToasts = stackMode === 'queue'
        ? toasts.slice(0, maxToasts)
        : stackMode === 'replace'
            ? toasts.slice(-maxToasts)
            : toasts;

    const getAnimation = (index) => {
        if (position.includes('bottom')) {
            return index === displayedToasts.length - 1 ? animation : 'slideInBottom';
        }
        return index === 0 ? animation : 'slideInRight';
    };

    return (
        <ToastContainer position={position}>
            {displayedToasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    title={toast.title}
                    duration={toast.duration}
                    onClose={onClose}
                    position={position}
                    animation={getAnimation(index)}
                    progress={toast.progress !== false && showProgress}
                    actions={toast.actions}
                    icon={toast.icon}
                    sound={toast.sound}
                    closable={toast.closable !== false}
                    pauseOnHover={pauseOnHover}
                    showIcon={showIcon}
                    showProgress={showProgress}
                    variant={toast.variant || variant}
                    size={toast.size || size}
                />
            ))}
        </ToastContainer>
    );
};

// Toast Provider Context
export const ToastContext = React.createContext();

export const ToastProvider = ({ children, ...props }) => {
    const [toasts, setToasts] = useState([]);
    const maxToasts = props.maxToasts || 5;

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            ...toast,
            createdAt: new Date(),
        };

        setToasts(prev => {
            if (prev.length >= maxToasts && props.stackMode !== 'queue') {
                return [...prev.slice(1), newToast];
            }
            return [...prev, newToast];
        });

        return id;
    }, [maxToasts, props.stackMode]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const success = useCallback((message, options = {}) => {
        return addToast({ message, type: 'success', ...options });
    }, [addToast]);

    const error = useCallback((message, options = {}) => {
        return addToast({ message, type: 'error', ...options });
    }, [addToast]);

    const warning = useCallback((message, options = {}) => {
        return addToast({ message, type: 'warning', ...options });
    }, [addToast]);

    const info = useCallback((message, options = {}) => {
        return addToast({ message, type: 'info', ...options });
    }, [addToast]);

    const loading = useCallback((message, options = {}) => {
        return addToast({ message, type: 'loading', duration: null, ...options });
    }, [addToast]);

    const promise = useCallback(async (promise, messages = {}) => {
        const loadingId = addToast({
            message: messages.loading || 'Loading...',
            type: 'loading',
            duration: null,
        });

        try {
            const result = await promise;
            removeToast(loadingId);
            addToast({
                message: messages.success || 'Operation completed successfully',
                type: 'success',
                ...messages.successOptions,
            });
            return result;
        } catch (error) {
            removeToast(loadingId);
            addToast({
                message: messages.error || error.message || 'Operation failed',
                type: 'error',
                ...messages.errorOptions,
            });
            throw error;
        }
    }, [addToast, removeToast]);

    const custom = useCallback((options) => {
        return addToast(options);
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
        loading,
        promise,
        custom,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast
                toasts={toasts}
                onClose={removeToast}
                {...props}
            />
        </ToastContext.Provider>
    );
};

// Custom hook for using toast
export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Individual Toast Export (for backward compatibility)
const ToastComponent = ({
    message,
    type = 'info',
    onClose,
    title,
    duration = 4000,
    position = 'top-right',
    ...props
}) => {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            onClose && onClose();
        }, 300);
    };

    if (!open) return null;

    return (
        <ToastContainer position={position}>
            <ToastItem
                id="single"
                message={message}
                type={type}
                title={title}
                duration={duration}
                onClose={handleClose}
                position={position}
                {...props}
            />
        </ToastContainer>
    );
};

export default ToastComponent;