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
import { joinFullName, normalizePhoneNumber } from '../../utils/formatters';
import {
    validateAdult,
    validateEmail,
    validateFullName,
    validatePassword,
    validatePasswordMatch,
    validatePhone,
    validateRequired,
    validateCBENameMatchesFullName,
} from '../../utils/validators';
import { checkEmailExists, checkPhoneExists } from '../../services/authService';
import api from '../../services/api';
import { registerSteps } from './RegisterSteps';
import TermsAndConditions from '../../components/legal/TermsAndConditions';
import PrivacyPolicy from '../../components/legal/PrivacyPolicy';

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
        const phone = validatePhone(values.countryCode, values.phoneNumber);
        if (email !== true) errors.email = email;
        if (phone !== true) errors.phoneNumber = phone;

        ['country', 'city'].forEach((field) => {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            const result = validateRequired(values[field], label);
            if (result !== true) errors[field] = result;
        });

        const cbeAccount = validateRequired(values.cbeAccountNumber, 'CBE Account Number');
        if (cbeAccount !== true) errors.cbeAccountNumber = cbeAccount;
        if (values.cbeAccountNumber && !/^\d{8,13}$/.test(values.cbeAccountNumber)) {
            errors.cbeAccountNumber = 'CBE Account Number must be 8-13 digits';
        }

        // CBE name must match full name
        const cbeNameResult = validateCBENameMatchesFullName(
            values.cbeAccountName,
            values.firstName,
            values.lastName
        );
        if (cbeNameResult !== true) errors.cbeAccountName = cbeNameResult;
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
        if (!values.acceptTerms) errors.acceptTerms = 'You must accept the terms and conditions';
        if (!values.acceptPrivacy) errors.acceptPrivacy = 'You must accept the privacy policy';
        if (!values.ageConfirmed) errors.ageConfirmed = 'You must confirm that you are at least 18 years old';
        if (!values.dataProcessingConsent) errors.dataProcessingConsent = 'You must consent to data processing';
    }

    return errors;
};

const COUNTRY_CITIES = {
    Ethiopia: ['Addis Ababa', 'Bahir Dar', 'Dire Dawa', 'Adama (Nazret)', 'Debre Markos', 'Mekelle', 'Gondar', 'Hawassa', 'Jimma', 'Dessie', 'Debre Birhan', 'Shashamane', 'Bishoftu (Debre Zeit)', 'Arba Minch', 'Hosaena', 'Woldia', 'Asella', 'Nekemte', 'Jijiga', 'Gambela', 'Axum', 'Lalibela', 'Harar', 'Dilla', 'Wolaita Sodo'],
    Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Machakos', 'Meru', 'Kericho', 'Embu'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston', 'Atlanta', 'Miami'],
    'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edinburgh', 'Liverpool', 'Bristol', 'Cardiff', 'Belfast', 'Leicester', 'Nottingham', 'Newcastle'],
    Canada: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart'],
    Germany: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    France: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Abha', 'Buraidah', 'Khamis Mushait'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain'],
};

const COUNTRIES = Object.keys(COUNTRY_CITIES);

function RegisterForm({ onBackToLogin, onSuccess }) {
    const auth = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [duplicateErrors, setDuplicateErrors] = useState({});
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const form = useFormValidation(initialValues, (values) => buildErrors(values, activeStep));

    const fullName = useMemo(
        () => joinFullName(form.values.firstName, form.values.lastName),
        [form.values.firstName, form.values.lastName]
    );

    const expectedCBEName = `${form.values.firstName.trim()} ${form.values.lastName.trim()}`.trim();

    const handleSocialClick = async (provider) => {
        if (!['google', 'apple'].includes(provider)) {
            toast(`${provider[0].toUpperCase() + provider.slice(1)} registration is not enabled yet.`);
            return;
        }
        setSocialLoading(provider);
        auth.startSocialLogin(provider);
    };

    const handleEmailBlur = async () => {
        const email = form.values.email.trim();
        form.setFieldTouched('email');
        if (!email || validateEmail(email) !== true) return;
        try {
            const res = await checkEmailExists(email);
            setDuplicateErrors((p) => ({ ...p, email: res?.exists ? 'This email is already registered' : undefined }));
        } catch { /* silent */ }
    };

    const handlePhoneBlur = async () => {
        const { countryCode, phoneNumber } = form.values;
        form.setFieldTouched('phoneNumber');
        if (validatePhone(countryCode, phoneNumber) !== true) return;
        try {
            const res = await checkPhoneExists(`${countryCode}${phoneNumber}`);
            setDuplicateErrors((p) => ({ ...p, phone: res?.exists ? 'This phone number is already registered' : undefined }));
        } catch { /* silent */ }
    };

    const handleAccountNumberBlur = async () => {
        const acct = form.values.cbeAccountNumber.trim();
        form.setFieldTouched('cbeAccountNumber');
        if (!acct || !/^\d{8,13}$/.test(acct)) return;
        try {
            const res = await api.get(`/auth/check-account?account_number=${encodeURIComponent(acct)}`);
            setDuplicateErrors((p) => ({ ...p, cbeAccountNumber: res?.data?.exists ? 'This CBE account is already registered' : undefined }));
        } catch { /* silent */ }
    };

    const handleCBENameBlur = () => {
        form.setFieldTouched('cbeAccountName');
        // Trigger re-validation immediately on blur
        const result = validateCBENameMatchesFullName(
            form.values.cbeAccountName,
            form.values.firstName,
            form.values.lastName
        );
        if (result !== true) {
            form.setErrors((prev) => ({ ...prev, cbeAccountName: result }));
        }
    };

    const handleNext = async () => {
        if (!form.validateForm()) return;

        if (activeStep === 1) {
            const newDupes = {};

            try {
                const emailRes = await checkEmailExists(form.values.email.trim());
                if (emailRes?.exists) newDupes.email = 'This email is already registered';
            } catch { /* silent */ }

            try {
                const phone = `${form.values.countryCode}${form.values.phoneNumber}`;
                const phoneRes = await checkPhoneExists(phone);
                if (phoneRes?.exists) newDupes.phone = 'This phone number is already registered';
            } catch { /* silent */ }

            try {
                const acctRes = await api.get(`/auth/check-account?account_number=${encodeURIComponent(form.values.cbeAccountNumber.trim())}`);
                if (acctRes?.data?.exists) newDupes.cbeAccountNumber = 'This CBE account is already registered';
            } catch { /* silent */ }

            setDuplicateErrors(newDupes);
            if (Object.keys(newDupes).length > 0) return;

            // Final CBE name check
            const cbeMatch = validateCBENameMatchesFullName(
                form.values.cbeAccountName,
                form.values.firstName,
                form.values.lastName
            );
            if (cbeMatch !== true) {
                form.setErrors({ cbeAccountName: cbeMatch });
                return;
            }
        }

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

            const result = await auth.register(payload);

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
        error: Boolean(form.touched[name] && form.errors[name]),
        helperText: (form.touched[name] && form.errors[name]) || ' ',
    });

    return (
        <Stack spacing={3}>
            <SocialButtons onClick={handleSocialClick} disabled={submitting} loadingProvider={socialLoading} />
            <Divider><Chip label="Secure Registration" size="small" /></Divider>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
                {registerSteps.map((step) => (
                    <Step key={step.id}><StepLabel>{step.label}</StepLabel></Step>
                ))}
            </Stepper>
            <Box>
                <Typography variant="overline" color="primary.main">
                    Step {activeStep + 1} of {registerSteps.length}
                </Typography>
                <Typography variant="h6">{registerSteps[activeStep].label}</Typography>
                <Typography color="text.secondary" variant="body2">{registerSteps[activeStep].caption}</Typography>
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
                        <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </TextField>
                </Stack>
            )}

            {activeStep === 1 && (
                <Stack spacing={2.5}>
                    <TextField
                        label="Email address"
                        fullWidth
                        autoComplete="email"
                        value={form.values.email}
                        onChange={(e) => form.setFieldValue('email', e.target.value)}
                        onBlur={handleEmailBlur}
                        error={Boolean((form.touched.email && form.errors.email) || duplicateErrors.email)}
                        helperText={(form.touched.email && form.errors.email) || duplicateErrors.email || ' '}
                    />
                    <PhoneInput
                        countryCode={form.values.countryCode}
                        phoneNumber={form.values.phoneNumber}
                        onCountryCodeChange={(value) => form.setFieldValue('countryCode', value)}
                        onPhoneNumberChange={(value) => form.setFieldValue('phoneNumber', value)}
                        phoneNumberError={(form.touched.phoneNumber && form.errors.phoneNumber) || duplicateErrors.phone}
                        onBlur={handlePhoneBlur}
                    />
                    <TextField label="Alternative phone" fullWidth {...fieldProps('alternativePhone')} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Country" fullWidth {...fieldProps('country')}
                                onChange={(e) => { form.setFieldValue('country', e.target.value); form.setFieldValue('city', ''); }}
                            >
                                {COUNTRIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="City / Region" fullWidth {...fieldProps('city')}>
                                {(COUNTRY_CITIES[form.values.country] || []).map((city) => (
                                    <MenuItem key={city} value={city}>{city}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }}>
                        <Chip label="Commercial Bank of Ethiopia Account (Required)" size="small" color="primary" />
                    </Divider>

                    <TextField
                        label="CBE Account Number"
                        fullWidth
                        inputProps={{ maxLength: 13 }}
                        value={form.values.cbeAccountNumber}
                        onChange={(e) => form.setFieldValue('cbeAccountNumber', e.target.value)}
                        onBlur={handleAccountNumberBlur}
                        error={Boolean((form.touched.cbeAccountNumber && form.errors.cbeAccountNumber) || duplicateErrors.cbeAccountNumber)}
                        helperText={(form.touched.cbeAccountNumber && form.errors.cbeAccountNumber) || duplicateErrors.cbeAccountNumber || 'Enter your 8-13 digit CBE account number'}
                    />

                    <TextField
                        label="CBE Account Name"
                        fullWidth
                        inputProps={{ maxLength: 100 }}
                        value={form.values.cbeAccountName}
                        onChange={(e) => form.setFieldValue('cbeAccountName', e.target.value)}
                        onBlur={handleCBENameBlur}
                        error={Boolean(form.touched.cbeAccountName && form.errors.cbeAccountName)}
                        helperText={
                            (form.touched.cbeAccountName && form.errors.cbeAccountName) ||
                            (expectedCBEName ? `Must match exactly: "${expectedCBEName}"` : 'Must match your full name on your CBE account')
                        }
                        InputProps={{
                            endAdornment: expectedCBEName && (
                                <Button
                                    type="button"
                                    size="small"
                                    sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                                    onClick={() => form.setFieldValue('cbeAccountName', expectedCBEName)}
                                >
                                    Use my name
                                </Button>
                            ),
                        }}
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
                        We will send a 6-digit email verification code as soon as your account is created. Resend is available after a short 30-second timer.
                    </Alert>
                    <Typography color="text.secondary" variant="body2">
                        After account creation you will land on the verification screen to enter the OTP and finish activation.
                    </Typography>
                    <TextField label="Referral code (optional)" fullWidth {...fieldProps('referralCode')} />
                    <Stack>
                        <FormControlLabel control={<Checkbox checked={form.values.acceptTerms} onChange={(e) => form.setFieldValue('acceptTerms', e.target.checked)} />} label={<span>I accept the <Link component="button" type="button" underline="hover" onClick={() => setShowTerms(true)}>Terms &amp; Conditions</Link></span>} />
                        <FormControlLabel control={<Checkbox checked={form.values.acceptPrivacy} onChange={(e) => form.setFieldValue('acceptPrivacy', e.target.checked)} />} label={<span>I accept the <Link component="button" type="button" underline="hover" onClick={() => setShowPrivacy(true)}>Privacy Policy</Link></span>} />
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

            <TermsAndConditions open={showTerms} onClose={() => setShowTerms(false)} />
            <PrivacyPolicy open={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </Stack>
    );
}

export default RegisterForm;
