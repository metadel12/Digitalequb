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
    Stepper,
    Step,
    StepLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    OutlinedInput,
    RadioGroup,
    Radio,
    FormLabel,
    Tooltip,
    LinearProgress,
    Chip,
    Avatar,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    Fade,
    Grow,
    Zoom
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    Apple as AppleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    VerifiedUser as VerifiedUserIcon,
    Security as SecurityIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    Close as CloseIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

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
    padding: theme.spacing(2),
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

const StepIconContainer = styled(Box)(({ theme, active, completed }) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.grey[300],
    color: completed || active ? 'white' : theme.palette.grey[600],
    transition: 'all 0.3s ease',
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

const RegisterForm = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Stepper state
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Personal Info', 'Account Details', 'Security', 'Verification'];

    // Form state
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        country: '',
        city: '',
        address: '',
        // Account Details
        username: '',
        password: '',
        confirmPassword: '',
        // Profile
        avatar: null,
        bio: '',
        interests: [],
        // Professional Info
        occupation: '',
        company: '',
        website: '',
        // Security
        securityQuestion: '',
        securityAnswer: '',
        receiveNewsletter: false,
        acceptTerms: false,
        acceptPrivacy: false
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    // Available options
    const countries = [
        'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
        'France', 'Japan', 'China', 'India', 'Brazil', 'Other'
    ];

    const interests = [
        'Technology', 'Business', 'Design', 'Marketing', 'Development',
        'Data Science', 'AI/ML', 'Cloud Computing', 'Cybersecurity', 'Blockchain'
    ];

    const securityQuestions = [
        'What is your mother\'s maiden name?',
        'What was the name of your first pet?',
        'What was your first car?',
        'What city were you born in?',
        'What is your favorite book?'
    ];

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        const feedback = [];

        if (!checks.length) feedback.push('At least 8 characters');
        if (!checks.uppercase) feedback.push('One uppercase letter');
        if (!checks.lowercase) feedback.push('One lowercase letter');
        if (!checks.number) feedback.push('One number');
        if (!checks.special) feedback.push('One special character');

        setPasswordStrength({ score, feedback });
        return { checks, score, feedback };
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate username
    const isValidUsername = (username) => {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file' && files && files[0]) {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                showSnackbar('File size must be less than 5MB', 'error');
                return;
            }
            if (!file.type.startsWith('image/')) {
                showSnackbar('Please upload an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData(prev => ({ ...prev, avatar: file }));
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Real-time password validation
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    // Handle interest selection
    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    // Validate current step
    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!isValidEmail(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
            if (!formData.phone) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,5}[-\s.]?[0-9]{1,5}$/.test(formData.phone)) {
                newErrors.phone = 'Please enter a valid phone number';
            }
            if (!formData.dateOfBirth) {
                newErrors.dateOfBirth = 'Date of birth is required';
            } else {
                const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
                if (age < 13) newErrors.dateOfBirth = 'You must be at least 13 years old';
            }
        }

        if (activeStep === 1) {
            if (!formData.username) {
                newErrors.username = 'Username is required';
            } else if (!isValidUsername(formData.username)) {
                newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
            }
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (passwordStrength.score < 3) {
                newErrors.password = 'Please choose a stronger password';
            }
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        if (activeStep === 2) {
            if (!formData.securityQuestion) newErrors.securityQuestion = 'Please select a security question';
            if (!formData.securityAnswer) newErrors.securityAnswer = 'Please provide an answer';
            if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the Terms of Service';
            if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep()) {
            if (activeStep === 1 && !emailVerified && !verificationSent) {
                handleSendVerification();
            } else {
                setActiveStep(prev => prev + 1);
            }
        }
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Send verification email
    const handleSendVerification = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setVerificationSent(true);
            setResendTimer(60);
            showSnackbar('Verification code sent to your email', 'success');

            // Start resend timer
            const interval = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } catch (error) {
            showSnackbar('Failed to send verification code', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Verify email code
    const handleVerifyEmail = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            showSnackbar('Please enter a valid 6-digit code', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock verification - in real app, verify with backend
            if (verificationCode === '123456') {
                setEmailVerified(true);
                showSnackbar('Email verified successfully!', 'success');
                setActiveStep(prev => prev + 1);
            } else {
                showSnackbar('Invalid verification code', 'error');
            }
        } catch (error) {
            showSnackbar('Verification failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Store user data
            const userData = {
                ...formData,
                createdAt: new Date().toISOString(),
                emailVerified: emailVerified,
                avatar: avatarPreview
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userEmail', formData.email);

            setOpenSuccessDialog(true);
            showSnackbar('Registration successful! Redirecting...', 'success');

            // Redirect after delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (error) {
            showSnackbar('Registration failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Render password strength indicator
    const renderPasswordStrength = () => {
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
                                bgcolor: level <= passwordStrength.score ? strengthColor[passwordStrength.score - 1] : '#e0e0e0',
                                borderRadius: 2,
                            }}
                        />
                    ))}
                </Box>
                <Typography variant="caption" sx={{ color: strengthColor[passwordStrength.score - 1] }}>
                    {strengthText[passwordStrength.score - 1]} Password
                </Typography>
                {passwordStrength.feedback.length > 0 && (
                    <Tooltip title={passwordStrength.feedback.join(', ')} arrow>
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    };

    // Render step content
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Fade in>
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.phone}
                                        helperText={errors.phone}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.dateOfBirth}
                                        helperText={errors.dateOfBirth}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            label="Gender"
                                        >
                                            <MenuItem value="">Prefer not to say</MenuItem>
                                            <MenuItem value="male">Male</MenuItem>
                                            <MenuItem value="female">Female</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            label="Country"
                                        >
                                            {countries.map(country => (
                                                <MenuItem key={country} value={country}>{country}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        multiline
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case 1:
                return (
                    <Fade in>
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <IconButton
                                                    component="label"
                                                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                    size="small"
                                                >
                                                    <CloudUploadIcon fontSize="small" />
                                                    <input type="file" hidden accept="image/*" onChange={handleChange} name="avatar" />
                                                </IconButton>
                                            }
                                        >
                                            <Avatar
                                                src={avatarPreview}
                                                sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40 }}
                                            >
                                                {!avatarPreview && (formData.firstName?.[0] || 'U')}
                                            </Avatar>
                                        </Badge>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.username}
                                        helperText={errors.username || "Username must be 3-20 characters (letters, numbers, underscore)"}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel htmlFor="password">Password</InputLabel>
                                        <OutlinedInput
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            error={!!errors.password}
                                            onFocus={() => setShowPasswordRequirements(true)}
                                            onBlur={() => setShowPasswordRequirements(false)}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        multiline
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Interests (select all that apply)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {interests.map(interest => (
                                            <Chip
                                                key={interest}
                                                label={interest}
                                                onClick={() => handleInterestToggle(interest)}
                                                color={formData.interests.includes(interest) ? 'primary' : 'default'}
                                                variant={formData.interests.includes(interest) ? 'filled' : 'outlined'}
                                                clickable
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Occupation"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case 2:
                return (
                    <Fade in>
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Security Question</InputLabel>
                                        <Select
                                            name="securityQuestion"
                                            value={formData.securityQuestion}
                                            onChange={handleChange}
                                            label="Security Question"
                                            required
                                            error={!!errors.securityQuestion}
                                        >
                                            {securityQuestions.map((question, index) => (
                                                <MenuItem key={index} value={question}>{question}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors.securityQuestion && (
                                            <FormHelperText error>{errors.securityQuestion}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Answer"
                                        name="securityAnswer"
                                        value={formData.securityAnswer}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.securityAnswer}
                                        helperText={errors.securityAnswer || "This will be used to recover your account"}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="receiveNewsletter"
                                                checked={formData.receiveNewsletter}
                                                onChange={handleChange}
                                            />
                                        }
                                        label="Subscribe to newsletter and updates"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="acceptTerms"
                                                checked={formData.acceptTerms}
                                                onChange={handleChange}
                                                required
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                I agree to the{' '}
                                                <Link href="/terms" target="_blank" underline="hover">
                                                    Terms of Service
                                                </Link>
                                            </Typography>
                                        }
                                    />
                                    {errors.acceptTerms && (
                                        <FormHelperText error>{errors.acceptTerms}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="acceptPrivacy"
                                                checked={formData.acceptPrivacy}
                                                onChange={handleChange}
                                                required
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                I agree to the{' '}
                                                <Link href="/privacy" target="_blank" underline="hover">
                                                    Privacy Policy
                                                </Link>
                                            </Typography>
                                        }
                                    />
                                    {errors.acceptPrivacy && (
                                        <FormHelperText error>{errors.acceptPrivacy}</FormHelperText>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                );

            case 3:
                return (
                    <Zoom in>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            {!emailVerified ? (
                                <>
                                    <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Verify Your Email
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        We've sent a verification code to {formData.email}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Verification Code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleVerifyEmail}
                                        disabled={isLoading}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    >
                                        {isLoading ? <CircularProgress size={24} /> : 'Verify Email'}
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={handleSendVerification}
                                        disabled={resendTimer > 0}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Email Verified!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Your email has been successfully verified. Click the button below to complete your registration.
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Zoom>
                );

            default:
                return null;
        }
    };

    return (
        <GradientBackground>
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <StyledPaper elevation={3}>
                        {/* Header */}
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
                                Create Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Join our community and start your journey
                            </Typography>
                        </Box>

                        {/* Social Sign Up */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GoogleIcon />}
                                    onClick={() => showSnackbar('Google sign up coming soon!', 'info')}
                                >
                                    {!isMobile && 'Google'}
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<FacebookIcon />}
                                    onClick={() => showSnackbar('Facebook sign up coming soon!', 'info')}
                                >
                                    {!isMobile && 'Facebook'}
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GitHubIcon />}
                                    onClick={() => showSnackbar('GitHub sign up coming soon!', 'info')}
                                >
                                    {!isMobile && 'GitHub'}
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="caption" color="text.secondary">
                                OR SIGN UP WITH EMAIL
                            </Typography>
                        </Divider>

                        {/* Stepper */}
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, overflowX: 'auto' }}>
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel StepIconComponent={() => (
                                        <StepIconContainer active={activeStep === index} completed={activeStep > index}>
                                            {activeStep > index ? <CheckCircleIcon /> : index + 1}
                                        </StepIconContainer>
                                    )}>
                                        {!isMobile && label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0 || isLoading}
                                startIcon={<ArrowBackIcon />}
                            >
                                Back
                            </Button>
                            {activeStep === steps.length - 1 ? (
                                <AnimatedButton
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={isLoading || !emailVerified}
                                    endIcon={!isLoading && <ArrowForwardIcon />}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                                </AnimatedButton>
                            ) : (
                                <AnimatedButton
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Next
                                </AnimatedButton>
                            )}
                        </Box>

                        {/* Login Link */}
                        <Box textAlign="center" mt={3}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link href="/login" underline="hover" sx={{ fontWeight: 600 }}>
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </StyledPaper>
                </motion.div>

                {/* Success Dialog */}
                <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
                    <DialogTitle sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6">Registration Successful!</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Welcome to our community! Your account has been created successfully.
                            You will be redirected to the login page shortly.
                        </Typography>
                        <LinearProgress sx={{ mt: 3 }} />
                    </DialogContent>
                </Dialog>

                {/* Snackbar */}
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

export default RegisterForm;
