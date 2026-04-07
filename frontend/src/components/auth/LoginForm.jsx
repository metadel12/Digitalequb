import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Checkbox,
    FormControlLabel,
    Link,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    IconButton,
    Divider,
    Grid,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
    Backdrop,
    Fade,
    Modal,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    FormControl
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    Apple as AppleIcon,
    ArrowBack as ArrowBackIcon,
    Security as SecurityIcon,
    VerifiedUser as VerifiedUserIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    boxShadow: theme.shadows[8],
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
    }
}));

const GradientBackground = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'rgba(255,255,255,0.05)\' d=\'M0 0 L100 0 L100 100 L0 100 Z M20 20 L80 20 L80 80 L20 80 Z\'/%3E%3C/svg%3E")',
        opacity: 0.1,
    }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const SocialButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.2),
    textTransform: 'none',
    flex: 1,
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.primary.main,
    },
}));

const LoginForm = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
        twoFactorCode: '',
        acceptTerms: false
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStep, setResetStep] = useState(0);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [securityQuestions, setSecurityQuestions] = useState([]);
    const [securityAnswers, setSecurityAnswers] = useState({});

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    // Check for saved session on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }

        // Check for lock timer
        const lockedUntil = localStorage.getItem('loginLockedUntil');
        if (lockedUntil && new Date() < new Date(lockedUntil)) {
            setIsLocked(true);
            const remaining = Math.ceil((new Date(lockedUntil) - new Date()) / 1000);
            setLockTimer(remaining);
            const interval = setInterval(() => {
                setLockTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsLocked(false);
                        localStorage.removeItem('loginLockedUntil');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate password strength
    const validatePasswordStrength = (password) => {
        const strength = {
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(strength).filter(Boolean).length;
        return { strength, score };
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (showTwoFactor && !formData.twoFactorCode) {
            newErrors.twoFactorCode = 'Two-factor authentication code is required';
        } else if (showTwoFactor && !/^\d{6}$/.test(formData.twoFactorCode)) {
            newErrors.twoFactorCode = 'Please enter a valid 6-digit code';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        return newErrors;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle login attempt
    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLocked) {
            showSnackbar(`Account is locked. Please try again in ${lockTimer} seconds.`, 'warning');
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate 2FA requirement for demo
            if (!showTwoFactor && formData.email === 'admin@example.com') {
                setShowTwoFactor(true);
                setIsLoading(false);
                showSnackbar('Please enter your 2FA code', 'info');
                return;
            }

            // Mock successful login
            if (formData.email === 'admin@example.com' && formData.password === 'Admin123!') {
                // Store session
                const sessionData = {
                    token: 'mock-jwt-token-' + Date.now(),
                    user: {
                        email: formData.email,
                        name: 'Admin User',
                        role: 'admin'
                    },
                    expiresAt: new Date(Date.now() + (formData.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)
                };

                if (formData.rememberMe) {
                    localStorage.setItem('authToken', sessionData.token);
                    localStorage.setItem('userData', JSON.stringify(sessionData.user));
                    localStorage.setItem('savedEmail', formData.email);
                } else {
                    sessionStorage.setItem('authToken', sessionData.token);
                    sessionStorage.setItem('userData', JSON.stringify(sessionData.user));
                }

                // Log successful login attempt
                logLoginAttempt(true);
                showSnackbar('Login successful! Redirecting...', 'success');

                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                // Failed login attempt
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                logLoginAttempt(false);

                if (newAttempts >= 5) {
                    const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
                    localStorage.setItem('loginLockedUntil', lockUntil);
                    setIsLocked(true);
                    setLockTimer(900);
                    showSnackbar('Too many failed attempts. Account locked for 15 minutes.', 'error');
                } else {
                    showSnackbar(`Invalid email or password. ${5 - newAttempts} attempts remaining.`, 'error');
                }

                setErrors({ submit: 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Login error:', error);
            showSnackbar('Network error. Please check your connection.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Log login attempt
    const logLoginAttempt = (success) => {
        const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            email: formData.email,
            success: success,
            ip: 'client-side' // In real app, get from server
        });
        // Keep only last 50 logs
        while (logs.length > 50) logs.shift();
        localStorage.setItem('loginLogs', JSON.stringify(logs));
    };

    // Handle forgot password
    const handleForgotPassword = async () => {
        if (!isValidEmail(resetEmail)) {
            showSnackbar('Please enter a valid email address', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Simulate sending reset code
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResetStep(1);
            showSnackbar('Reset code sent to your email', 'success');
        } catch (error) {
            showSnackbar('Failed to send reset code', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!resetCode || resetCode.length !== 6) {
            showSnackbar('Please enter a valid 6-digit code', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResetStep(2);
            showSnackbar('Code verified successfully', 'success');
        } catch (error) {
            showSnackbar('Invalid verification code', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            showSnackbar('Passwords do not match', 'error');
            return;
        }

        const { score } = validatePasswordStrength(newPassword);
        if (score < 4) {
            showSnackbar('Please choose a stronger password', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSnackbar('Password reset successful! Please login with your new password.', 'success');
            setShowForgotPassword(false);
            setResetStep(0);
            setResetEmail('');
            setResetCode('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            showSnackbar('Failed to reset password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Social login handlers
    const handleSocialLogin = (provider) => {
        showSnackbar(`Connecting with ${provider}...`, 'info');
        // Implement OAuth flow here
        setTimeout(() => {
            window.location.href = `/auth/${provider.toLowerCase()}`;
        }, 1000);
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Toggle password visibility
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // Render password strength indicator
    const renderPasswordStrength = () => {
        const { strength, score } = validatePasswordStrength(formData.password);
        if (!formData.password) return null;

        const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColor = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2e7d32'];

        return (
            <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <Box
                            key={level}
                            sx={{
                                height: 4,
                                flex: 1,
                                bgcolor: level <= score ? strengthColor[score - 1] : '#e0e0e0',
                                borderRadius: 2,
                            }}
                        />
                    ))}
                </Box>
                <Typography variant="caption" sx={{ color: strengthColor[score - 1] }}>
                    {strengthText[score - 1]} Password
                </Typography>
                {score < 4 && (
                    <FormHelperText>
                        Use at least 8 characters with uppercase, lowercase, numbers, and special characters
                    </FormHelperText>
                )}
            </Box>
        );
    };

    return (
        <GradientBackground>
            <Container maxWidth="sm">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                >
                    <StyledPaper elevation={3}>
                        {/* Brand Header */}
                        <Box textAlign="center" mb={4}>
                            <Typography
                                variant="h4"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}
                            >
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to continue to your account
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {errors.submit && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {errors.submit}
                            </Alert>
                        )}

                        {/* Social Login Buttons */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}>
                                <SocialButton
                                    variant="outlined"
                                    onClick={() => handleSocialLogin('Google')}
                                    disabled={isLoading}
                                    startIcon={<GoogleIcon />}
                                >
                                    {!isMobile && 'Google'}
                                </SocialButton>
                            </Grid>
                            <Grid item xs={4}>
                                <SocialButton
                                    variant="outlined"
                                    onClick={() => handleSocialLogin('Facebook')}
                                    disabled={isLoading}
                                    startIcon={<FacebookIcon />}
                                >
                                    {!isMobile && 'Facebook'}
                                </SocialButton>
                            </Grid>
                            <Grid item xs={4}>
                                <SocialButton
                                    variant="outlined"
                                    onClick={() => handleSocialLogin('Apple')}
                                    disabled={isLoading}
                                    startIcon={<AppleIcon />}
                                >
                                    {!isMobile && 'Apple'}
                                </SocialButton>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                OR CONTINUE WITH EMAIL
                            </Typography>
                        </Divider>

                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                disabled={isLoading || isLocked}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <FormControl fullWidth margin="normal" variant="outlined">
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading || isLocked}
                                    error={!!errors.password}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={toggleShowPassword}
                                                edge="end"
                                                disabled={isLoading || isLocked}
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                />
                                {errors.password && (
                                    <FormHelperText error>{errors.password}</FormHelperText>
                                )}
                                {formData.password && renderPasswordStrength()}
                            </FormControl>

                            {/* 2FA Field */}
                            {showTwoFactor && (
                                <TextField
                                    fullWidth
                                    label="Two-Factor Authentication Code"
                                    name="twoFactorCode"
                                    value={formData.twoFactorCode}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                    disabled={isLoading}
                                    error={!!errors.twoFactorCode}
                                    helperText={errors.twoFactorCode || 'Enter the 6-digit code from your authenticator app'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SecurityIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}

                            {/* Options Row */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 2,
                                    mb: 2,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            disabled={isLoading || isLocked}
                                            color="primary"
                                        />
                                    }
                                    label="Remember me"
                                />
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => setShowForgotPassword(true)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    Forgot password?
                                </Link>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                        disabled={isLoading || isLocked}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        I agree to the{' '}
                                        <Link href="/terms" target="_blank">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" target="_blank">
                                            Privacy Policy
                                        </Link>
                                    </Typography>
                                }
                            />
                            {errors.acceptTerms && (
                                <FormHelperText error sx={{ mt: 1 }}>
                                    {errors.acceptTerms}
                                </FormHelperText>
                            )}

                            {/* Login Button */}
                            <AnimatedButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading || isLocked}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : isLocked ? (
                                    `Locked (${Math.floor(lockTimer / 60)}:${(lockTimer % 60).toString().padStart(2, '0')})`
                                ) : (
                                    'Sign In'
                                )}
                            </AnimatedButton>

                            {/* Security Options */}
                            <Box textAlign="center" mt={2}>
                                <Button
                                    size="small"
                                    startIcon={<FingerprintIcon />}
                                    onClick={() => setShowSecurityModal(true)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Login with biometrics
                                </Button>
                            </Box>
                        </form>

                        {/* Sign Up Link */}
                        <Box textAlign="center" mt={3}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link href="/register" underline="hover" sx={{ fontWeight: 600 }}>
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </StyledPaper>
                </motion.div>

                {/* Forgot Password Modal */}
                <Dialog
                    open={showForgotPassword}
                    onClose={() => setShowForgotPassword(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Reset Password
                        <IconButton
                            onClick={() => setShowForgotPassword(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Stepper activeStep={resetStep} sx={{ mb: 4, mt: 2 }}>
                            <Step>
                                <StepLabel>Email</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Verify</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Reset</StepLabel>
                            </Step>
                        </Stepper>

                        {resetStep === 0 && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Enter your email address and we'll send you a verification code.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    margin="normal"
                                    type="email"
                                />
                            </Box>
                        )}

                        {resetStep === 1 && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Enter the 6-digit code sent to {resetEmail}
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Verification Code"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    margin="normal"
                                    placeholder="000000"
                                />
                            </Box>
                        )}

                        {resetStep === 2 && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Create a new password for your account
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    margin="normal"
                                />
                                {newPassword && renderPasswordStrength()}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setShowForgotPassword(false)}>Cancel</Button>
                        {resetStep === 0 && (
                            <Button
                                variant="contained"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                Send Code
                            </Button>
                        )}
                        {resetStep === 1 && (
                            <Button
                                variant="contained"
                                onClick={handleVerifyCode}
                                disabled={isLoading}
                            >
                                Verify Code
                            </Button>
                        )}
                        {resetStep === 2 && (
                            <Button
                                variant="contained"
                                onClick={handleResetPassword}
                                disabled={isLoading}
                            >
                                Reset Password
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                {/* Biometric Login Modal */}
                <Modal
                    open={showSecurityModal}
                    onClose={() => setShowSecurityModal(false)}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{ timeout: 500 }}
                >
                    <Fade in={showSecurityModal}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 400,
                                bgcolor: 'background.paper',
                                borderRadius: 4,
                                boxShadow: 24,
                                p: 4,
                                textAlign: 'center',
                            }}
                        >
                            <VerifiedUserIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Biometric Authentication
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Use your fingerprint or face recognition to login
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<FingerprintIcon />}
                                onClick={() => {
                                    showSnackbar('Biometric authentication coming soon!', 'info');
                                    setShowSecurityModal(false);
                                }}
                            >
                                Authenticate
                            </Button>
                            <Button
                                variant="text"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => setShowSecurityModal(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Fade>
                </Modal>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%', borderRadius: 2 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </GradientBackground>
    );
};

export default LoginForm;
