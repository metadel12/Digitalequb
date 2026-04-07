import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Link,
    MenuItem,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import PhoneInput from '../../components/common/PhoneInput';
import SocialButtons from '../../components/common/SocialButtons';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { resendVerification } from '../../services/authService';
import { joinFullName, normalizePhoneNumber } from '../../utils/formatters';
import {
    validateAdult,
    validateEmail,
    validateEmailDomain,
    validateFullName,
    validatePassword,
    validatePasswordMatch,
    validatePhone,
    validateRequired,
} from '../../utils/validators';
import EmailVerification from './EmailVerification';
import PhoneVerification from './PhoneVerification';
import { registerSteps } from './RegisterSteps';

const initialValues = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    email: '',
    countryCode: '+251',
    phoneNumber: '',
    alternativePhone: '',
    country: 'Ethiopia',
    city: '',
    subCity: '',
    detailedAddress: '',
    cbeAccountNumber: '',
    cbeAccountName: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'first_teacher',
    securityAnswer: '',
    language: 'English',
    currency: 'ETB',
    notificationsEmail: true,
    notificationsSms: true,
    notificationsPush: true,
    marketingOptIn: false,
    referralCode: '',
    emailOtp: '',
    phoneOtp: '',
    acceptTerms: false,
    acceptPrivacy: false,
    ageConfirmed: false,
    dataProcessingConsent: false,
};

const buildErrors = (values, step) => {
    const errors = {};

    if (step === 0) {
        const first = validateFullName(values.firstName, 'First name');
        const last = validateFullName(values.lastName, 'Last name');
        const dob = validateAdult(values.dateOfBirth);
        if (first !== true) errors.firstName = first;
        if (last !== true) errors.lastName = last;
        if (dob !== true) errors.dateOfBirth = dob;
    }

    if (step === 1) {
        const email = validateEmail(values.email);
        const domain = validateEmailDomain(values.email);
        const phone = validatePhone(values.countryCode, values.phoneNumber);
        if (email !== true) errors.email = email;
        if (domain !== true) errors.email = domain;
        if (phone !== true) errors.phoneNumber = phone;

        ['country', 'city', 'subCity', 'detailedAddress'].forEach((field) => {
            const label = field === 'subCity'
                ? 'Sub-city / Woreda'
                : field === 'detailedAddress'
                    ? 'Detailed address'
                    : field.charAt(0).toUpperCase() + field.slice(1);
            const result = validateRequired(values[field], label);
            if (result !== true) errors[field] = result;
        });

        // Validate CBE account information
        const cbeAccount = validateRequired(values.cbeAccountNumber, 'CBE Account Number');
        const cbeName = validateRequired(values.cbeAccountName, 'CBE Account Name');
        if (cbeAccount !== true) errors.cbeAccountNumber = cbeAccount;
        if (cbeName !== true) errors.cbeAccountName = cbeName;

        // Validate CBE account number format (8-13 digits)
        if (values.cbeAccountNumber && !/^\d{8,13}$/.test(values.cbeAccountNumber)) {
            errors.cbeAccountNumber = 'CBE Account Number must be 8-13 digits';
        }
    }

    if (step === 2) {
        const password = validatePassword(values.password);
        const match = validatePasswordMatch(values.password, values.confirmPassword);
        const securityAnswer = validateRequired(values.securityAnswer, 'Security answer');
        if (password !== true) errors.password = password;
        if (match !== true) errors.confirmPassword = match;
        if (securityAnswer !== true) errors.securityAnswer = securityAnswer;
    }

    if (step === 3) {
        if (values.emailOtp.length !== 6) errors.emailOtp = 'Enter the 6-digit email verification code';
        if (values.phoneOtp.length !== 6) errors.phoneOtp = 'Enter the 6-digit phone verification code';
        if (!values.acceptTerms) errors.acceptTerms = 'You must accept the terms and conditions';
        if (!values.acceptPrivacy) errors.acceptPrivacy = 'You must accept the privacy policy';
        if (!values.ageConfirmed) errors.ageConfirmed = 'You must confirm that you are at least 18 years old';
        if (!values.dataProcessingConsent) errors.dataProcessingConsent = 'You must consent to data processing';
    }

    return errors;
};

function RegisterForm({ onBackToLogin, onSuccess }) {
    const { register: registerUser } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [emailResendSeconds, setEmailResendSeconds] = useState(0);
    const [phoneResendSeconds, setPhoneResendSeconds] = useState(0);
    const form = useFormValidation(initialValues, (values) => buildErrors(values, activeStep));

    const fullName = useMemo(
        () => joinFullName(form.values.firstName, form.values.lastName),
        [form.values.firstName, form.values.lastName]
    );

    const startCountdown = (setter) => {
        setter(60);
        const timer = window.setInterval(() => {
            setter((current) => {
                if (current <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);
    };

    const handleSocialClick = async (provider) => {
        setSocialLoading(provider);
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        setSocialLoading(null);
        toast(`${provider[0].toUpperCase() + provider.slice(1)} registration is ready for backend OAuth hookup.`);
    };

    const handleResend = async (channel) => {
        await resendVerification({
            channel,
            email: form.values.email,
            phone_number: normalizePhoneNumber(form.values.countryCode, form.values.phoneNumber),
        });
        toast.success(`Verification code resent by ${channel}.`);
        startCountdown(channel === 'email' ? setEmailResendSeconds : setPhoneResendSeconds);
    };

    const handleNext = async () => {
        if (!form.validateForm()) return;

        if (activeStep < registerSteps.length - 1) {
            setActiveStep((prev) => prev + 1);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                full_name: fullName,
                email: form.values.email.trim(),
                phone_number: normalizePhoneNumber(form.values.countryCode, form.values.phoneNumber),
                password: form.values.password,
                confirm_password: form.values.confirmPassword,
                bank_account: {
                    bank_name: 'Commercial Bank of Ethiopia',
                    account_number: form.values.cbeAccountNumber.trim(),
                    account_name: form.values.cbeAccountName.trim(),
                },
            };

            const result = await registerUser(payload);

            if (!result?.success) {
                form.setErrors({ submit: result?.error || 'Registration failed. Please try again.' });
                return;
            }

            onSuccess?.(form.values.email);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        form.setErrors({});
        if (activeStep === 0) {
            onBackToLogin?.();
            return;
        }
        setActiveStep((prev) => Math.max(0, prev - 1));
    };

    const fieldProps = (name) => ({
        value: form.values[name],
        onChange: (event) => form.setFieldValue(name, event.target.value),
        onBlur: () => form.setFieldTouched(name),
        error: Boolean(form.errors[name]),
        helperText: form.errors[name] || ' ',
    });

    return (
        <Stack spacing={3}>
            <SocialButtons onClick={handleSocialClick} disabled={submitting} loadingProvider={socialLoading} />
            <Divider>
                <Chip label="Secure Registration" size="small" />
            </Divider>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
                {registerSteps.map((step) => (
                    <Step key={step.id}>
                        <StepLabel>{step.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box>
                <Typography variant="overline" color="primary.main">
                    Step {activeStep + 1} of {registerSteps.length}
                </Typography>
                <Typography variant="h6">{registerSteps[activeStep].label}</Typography>
                <Typography color="text.secondary" variant="body2">
                    {registerSteps[activeStep].caption}
                </Typography>
            </Box>
            {form.errors.submit && <Alert severity="error">{form.errors.submit}</Alert>}
            {activeStep === 0 && (
                <Stack spacing={2.5}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="First name" fullWidth inputProps={{ maxLength: 50 }} {...fieldProps('firstName')} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Last name" fullWidth inputProps={{ maxLength: 50 }} {...fieldProps('lastName')} />
                        </Grid>
                    </Grid>
                    <TextField type="date" label="Date of birth" fullWidth InputLabelProps={{ shrink: true }} {...fieldProps('dateOfBirth')} />
                    <TextField select label="Gender" fullWidth {...fieldProps('gender')}>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                        <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </TextField>
                </Stack>
            )}
            {activeStep === 1 && (
                <Stack spacing={2.5}>
                    <TextField label="Email address" fullWidth autoComplete="email" {...fieldProps('email')} />
                    <PhoneInput
                        countryCode={form.values.countryCode}
                        phoneNumber={form.values.phoneNumber}
                        onCountryCodeChange={(value) => form.setFieldValue('countryCode', value)}
                        onPhoneNumberChange={(value) => form.setFieldValue('phoneNumber', value)}
                        phoneNumberError={form.errors.phoneNumber}
                    />
                    <TextField label="Alternative phone" fullWidth {...fieldProps('alternativePhone')} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Country" fullWidth {...fieldProps('country')}>
                                <MenuItem value="Ethiopia">Ethiopia</MenuItem>
                                <MenuItem value="Kenya">Kenya</MenuItem>
                                <MenuItem value="United States">United States</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="City / Region" fullWidth {...fieldProps('city')} />
                        </Grid>
                    </Grid>
                    <TextField label="Sub-city / Woreda" fullWidth {...fieldProps('subCity')} />
                    <TextField label="Detailed address" fullWidth multiline minRows={3} {...fieldProps('detailedAddress')} />
                    <Divider sx={{ my: 2 }}>
                        <Chip label="Commercial Bank of Ethiopia Account (Required)" size="small" color="primary" />
                    </Divider>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        A valid Commercial Bank of Ethiopia account is required for DigiEqub participation. This account will be used for all transactions and payouts.
                    </Alert>
                    <TextField
                        label="CBE Account Number"
                        fullWidth
                        inputProps={{ maxLength: 13 }}
                        helperText="Enter your 8-13 digit CBE account number"
                        {...fieldProps('cbeAccountNumber')}
                    />
                    <TextField
                        label="CBE Account Name"
                        fullWidth
                        inputProps={{ maxLength: 100 }}
                        helperText="Enter the full name registered with your CBE account"
                        {...fieldProps('cbeAccountName')}
                    />
                </Stack>
            )}
            {activeStep === 2 && (
                <Stack spacing={2.5}>
                    <TextField label="Password" type="password" fullWidth autoComplete="new-password" {...fieldProps('password')} />
                    <PasswordStrengthMeter password={form.values.password} />
                    <TextField label="Confirm password" type="password" fullWidth autoComplete="new-password" {...fieldProps('confirmPassword')} />
                    <TextField select label="Security question" fullWidth {...fieldProps('securityQuestion')}>
                        <MenuItem value="first_teacher">Who was your first teacher?</MenuItem>
                        <MenuItem value="childhood_friend">What is the name of your childhood friend?</MenuItem>
                        <MenuItem value="birth_city">In which city were you born?</MenuItem>
                        <MenuItem value="custom">Use custom question in backend</MenuItem>
                    </TextField>
                    <TextField label="Security answer" fullWidth {...fieldProps('securityAnswer')} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Preferred language" fullWidth {...fieldProps('language')}>
                                <MenuItem value="English">English</MenuItem>
                                <MenuItem value="Amharic">Amharic</MenuItem>
                                <MenuItem value="Oromiffa">Oromiffa</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Currency preference" fullWidth {...fieldProps('currency')}>
                                <MenuItem value="ETB">ETB</MenuItem>
                                <MenuItem value="USD">USD</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                    <Stack>
                        <FormControlLabel control={<Checkbox checked={form.values.notificationsEmail} onChange={(e) => form.setFieldValue('notificationsEmail', e.target.checked)} />} label="Email notifications" />
                        <FormControlLabel control={<Checkbox checked={form.values.notificationsSms} onChange={(e) => form.setFieldValue('notificationsSms', e.target.checked)} />} label="SMS notifications" />
                        <FormControlLabel control={<Checkbox checked={form.values.notificationsPush} onChange={(e) => form.setFieldValue('notificationsPush', e.target.checked)} />} label="Push notifications" />
                        <FormControlLabel control={<Checkbox checked={form.values.marketingOptIn} onChange={(e) => form.setFieldValue('marketingOptIn', e.target.checked)} />} label="Marketing communications (optional)" />
                    </Stack>
                </Stack>
            )}
            {activeStep === 3 && (
                <Stack spacing={3}>
                    <Alert severity="info">
                        Verification UI is ready for `/api/v1/auth/verify-email`, `/verify-phone`, and `/resend-verification`.
                    </Alert>
                    <EmailVerification
                        value={form.values.emailOtp}
                        onChange={(value) => form.setFieldValue('emailOtp', value)}
                        resendSeconds={emailResendSeconds}
                        onResend={() => handleResend('email')}
                        disabled={submitting}
                    />
                    {form.errors.emailOtp && <Typography color="error.main" variant="caption">{form.errors.emailOtp}</Typography>}
                    <PhoneVerification
                        value={form.values.phoneOtp}
                        onChange={(value) => form.setFieldValue('phoneOtp', value)}
                        resendSeconds={phoneResendSeconds}
                        onResend={() => handleResend('sms')}
                        disabled={submitting}
                    />
                    {form.errors.phoneOtp && <Typography color="error.main" variant="caption">{form.errors.phoneOtp}</Typography>}
                    <TextField label="Referral code (optional)" fullWidth {...fieldProps('referralCode')} />
                    <Stack>
                        <FormControlLabel control={<Checkbox checked={form.values.acceptTerms} onChange={(e) => form.setFieldValue('acceptTerms', e.target.checked)} />} label={<span>I accept the <Link href="/terms" underline="hover">Terms & Conditions</Link></span>} />
                        <FormControlLabel control={<Checkbox checked={form.values.acceptPrivacy} onChange={(e) => form.setFieldValue('acceptPrivacy', e.target.checked)} />} label={<span>I accept the <Link href="/privacy" underline="hover">Privacy Policy</Link></span>} />
                        <FormControlLabel control={<Checkbox checked={form.values.ageConfirmed} onChange={(e) => form.setFieldValue('ageConfirmed', e.target.checked)} />} label="I confirm that I am at least 18 years old" />
                        <FormControlLabel control={<Checkbox checked={form.values.dataProcessingConsent} onChange={(e) => form.setFieldValue('dataProcessingConsent', e.target.checked)} />} label="I consent to data processing for account creation and security checks" />
                    </Stack>
                    {(form.errors.acceptTerms || form.errors.acceptPrivacy || form.errors.ageConfirmed || form.errors.dataProcessingConsent) && (
                        <Alert severity="error">
                            {form.errors.acceptTerms || form.errors.acceptPrivacy || form.errors.ageConfirmed || form.errors.dataProcessingConsent}
                        </Alert>
                    )}
                </Stack>
            )}
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                <Button variant="outlined" onClick={handleBack}>
                    {activeStep === 0 ? 'Back to sign in' : 'Back'}
                </Button>
                <Button variant="contained" onClick={handleNext} disabled={submitting}>
                    {submitting ? 'Creating account...' : activeStep === registerSteps.length - 1 ? 'Create account' : 'Continue'}
                </Button>
            </Stack>
        </Stack>
    );
}

export default RegisterForm;
