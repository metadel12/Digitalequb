import { useCallback, useEffect, useMemo, useState } from 'react';
import { addWeeks, format } from 'date-fns';
import { createStoredGroup } from '../utils/groupStorage';
import {
    createComprehensiveGroup,
    deployGroupContract,
    generateJoinCode,
    sendGroupEmailInvites,
    sendGroupSmsInvites,
    validateGroupName,
} from '../services/groups';

const DRAFT_KEY = 'digiequb-create-group-draft';

const defaultFormData = {
    name: '',
    description: '',
    groupType: 'fixed',
    groupImage: null,
    contributionAmount: 1000,
    currency: 'ETB',
    frequency: 'weekly',
    durationWeeks: 12,
    maxMembers: 10,
    privacy: 'private',
    approvalRequired: true,
    latePenalty: 0,
    gracePeriodDays: 3,
    earlyWithdrawal: false,
    rulesText: '',
    termsAccepted: false,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    inviteEmails: [],
    invitePhones: [],
    bulkInvites: '',
    initialMembers: [],
};

const validators = {
    0: (data) => {
        const errors = {};
        if (!data.name?.trim()) errors.name = 'Group name is required';
        if (data.name?.trim().length < 3) errors.name = 'Group name must be at least 3 characters';
        if (data.name?.trim().length > 50) errors.name = 'Group name must not exceed 50 characters';
        if (!['fixed', 'random', 'bid'].includes(data.groupType)) errors.groupType = 'Select a valid group type';
        return errors;
    },
    1: (data) => {
        const errors = {};
        if (Number(data.contributionAmount) < 100) errors.contributionAmount = 'Minimum contribution is 100';
        if (!['ETB', 'USD'].includes(data.currency)) errors.currency = 'Select a valid currency';
        if (!['daily', 'weekly', 'monthly'].includes(data.frequency)) errors.frequency = 'Select a valid frequency';
        if (Number(data.durationWeeks) < 1 || Number(data.durationWeeks) > 52) errors.durationWeeks = 'Duration must be between 1 and 52 weeks';
        return errors;
    },
    2: (data) => {
        const errors = {};
        if (Number(data.maxMembers) < 2 || Number(data.maxMembers) > 50) errors.maxMembers = 'Members must be between 2 and 50';
        if (!['public', 'private'].includes(data.privacy)) errors.privacy = 'Select a valid privacy option';
        return errors;
    },
    3: (data) => {
        const errors = {};
        if (Number(data.latePenalty) < 0 || Number(data.latePenalty) > 100) errors.latePenalty = 'Penalty must be between 0 and 100';
        if (!data.termsAccepted) errors.termsAccepted = 'You must accept the terms';
        return errors;
    },
};

const parseDraft = () => {
    if (typeof window === 'undefined') return defaultFormData;

    try {
        const saved = window.localStorage.getItem(DRAFT_KEY);
        return saved ? { ...defaultFormData, ...JSON.parse(saved) } : defaultFormData;
    } catch (error) {
        console.error('Failed to parse create group draft:', error);
        return defaultFormData;
    }
};

export const useCreateGroup = ({ user, onSuccess } = {}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(parseDraft);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [nameAvailable, setNameAvailable] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, [formData]);

    const computed = useMemo(() => {
        const amount = Number(formData.contributionAmount || 0);
        const durationWeeks = Number(formData.durationWeeks || 0);
        const memberCount = Math.max((formData.initialMembers?.length || 0) + 1, Number(formData.maxMembers || 0));
        const totalContributionPerMember = amount * durationWeeks;
        const totalGroupFund = amount * memberCount * durationWeeks;
        const endDate = formData.startDate ? format(addWeeks(new Date(formData.startDate), durationWeeks), 'yyyy-MM-dd') : '';

        return {
            totalContributionPerMember,
            totalGroupFund,
            endDate,
        };
    }, [formData]);

    const validateStep = useCallback((step = currentStep) => {
        const stepErrors = validators[step]?.(formData) || {};
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        return Object.keys(stepErrors).length === 0;
    }, [currentStep, formData]);

    const nextStep = useCallback(() => {
        if (!validateStep(currentStep)) return false;
        setCurrentStep((prev) => Math.min(prev + 1, 3));
        return true;
    }, [currentStep, validateStep]);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const updateFormData = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (field === 'name') {
            setNameAvailable(null);
        }
    }, []);

    const resetForm = useCallback(() => {
        setCurrentStep(0);
        setFormData(defaultFormData);
        setErrors({});
        setSuccess(false);
        setNameAvailable(null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(DRAFT_KEY);
        }
    }, []);

    const checkNameAvailability = useCallback(async () => {
        const candidate = formData.name?.trim();
        if (!candidate || candidate.length < 3) {
            setNameAvailable(null);
            return null;
        }

        try {
            const response = await validateGroupName({ name: candidate });
            const available = Boolean(response?.data?.available);
            setNameAvailable(available);
            if (!available) {
                setErrors((prev) => ({ ...prev, name: 'Group name already exists' }));
            }
            return available;
        } catch (error) {
            setNameAvailable(null);
            return null;
        }
    }, [formData.name]);

    const submitGroup = useCallback(async () => {
        const finalErrors = validators[3]?.(formData) || {};
        if (Object.keys(finalErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...finalErrors }));
            return null;
        }

        setLoading(true);
        try {
            const availability = await checkNameAvailability();
            if (availability === false) {
                return null;
            }

            const apiPayload = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                group_type: formData.groupType,
                contribution_amount: Number(formData.contributionAmount),
                currency: formData.currency,
                frequency: formData.frequency,
                duration_weeks: Number(formData.durationWeeks),
                max_members: Number(formData.maxMembers),
                privacy: formData.privacy,
                approval_required: Boolean(formData.approvalRequired),
                late_penalty: Number(formData.latePenalty || 0),
                grace_period_days: Number(formData.gracePeriodDays || 0),
                early_withdrawal: Boolean(formData.earlyWithdrawal),
                rules: formData.rulesText?.trim() || '',
                invite_emails: formData.inviteEmails,
                invite_phones: formData.invitePhones,
            };

            let created;

            try {
                const contractResponse = await deployGroupContract({
                    group_name: apiPayload.name,
                    contribution_amount: apiPayload.contribution_amount,
                    total_members: apiPayload.max_members,
                    frequency: apiPayload.frequency,
                    creator_address: user?.wallet_address || null,
                });

                const joinCodeResponse = await generateJoinCode({ group_name: apiPayload.name });
                const creationResponse = await createComprehensiveGroup(apiPayload);

                if (apiPayload.invite_phones?.length) {
                    await sendGroupSmsInvites({
                        group_name: apiPayload.name,
                        join_code: joinCodeResponse?.data?.join_code || creationResponse?.data?.group?.join_code,
                        group_link: `${window.location.origin}/groups`,
                        amount: apiPayload.contribution_amount,
                        currency: apiPayload.currency,
                        frequency: apiPayload.frequency,
                        recipients: apiPayload.invite_phones,
                    });
                }

                if (apiPayload.invite_emails?.length) {
                    await sendGroupEmailInvites({
                        group_name: apiPayload.name,
                        join_code: joinCodeResponse?.data?.join_code || creationResponse?.data?.group?.join_code,
                        group_link: `${window.location.origin}/groups`,
                        amount: apiPayload.contribution_amount,
                        currency: apiPayload.currency,
                        frequency: apiPayload.frequency,
                        recipients: apiPayload.invite_emails,
                    });
                }

                created = {
                    id: creationResponse?.data?.group_id || creationResponse?.data?.group?._id,
                    name: apiPayload.name,
                    inviteCode: joinCodeResponse?.data?.join_code || creationResponse?.data?.group?.join_code,
                    contractAddress: contractResponse?.data?.contract_address || creationResponse?.data?.group?.contract_address,
                    totalFund: creationResponse?.data?.group?.total_fund || computed.totalGroupFund,
                    backendGroup: creationResponse?.data?.group || null,
                };
            } catch (error) {
                created = createStoredGroup(
                    {
                        name: formData.name,
                        description: formData.description,
                        type: formData.groupType,
                        contributionAmount: Number(formData.contributionAmount),
                        currency: formData.currency,
                        frequency: formData.frequency,
                        durationWeeks: Number(formData.durationWeeks),
                        maxMembers: Number(formData.maxMembers),
                        isPrivate: formData.privacy === 'private',
                        requiresApproval: formData.approvalRequired,
                        startDate: formData.startDate,
                        rules: {
                            latePaymentFee: Number(formData.latePenalty || 0),
                            withdrawalNoticeDays: Number(formData.gracePeriodDays || 0),
                            allowEarlyWithdrawal: Boolean(formData.earlyWithdrawal),
                            requireCoSigner: false,
                        },
                        rulesText: formData.rulesText,
                        inviteEmails: formData.inviteEmails,
                        invitePhones: formData.invitePhones,
                        initialMembers: formData.initialMembers,
                        groupImage: formData.groupImage,
                    },
                    user
                );
            }

            setSuccess(true);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(DRAFT_KEY);
            }
            if (onSuccess) onSuccess(created);
            return created;
        } finally {
            setLoading(false);
        }
    }, [checkNameAvailability, computed.totalGroupFund, formData, onSuccess, user]);

    return {
        currentStep,
        formData,
        loading,
        errors,
        success,
        nameAvailable,
        computed,
        nextStep,
        prevStep,
        updateFormData,
        validateStep,
        checkNameAvailability,
        submitGroup,
        resetForm,
        setCurrentStep,
        setFormData,
    };
};

export default useCreateGroup;
