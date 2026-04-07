import { useMemo, useState } from 'react';

export function useFormValidation(initialValues, validate) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const setFieldValue = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const setFieldTouched = (field, isTouched = true) => {
        setTouched((prev) => ({ ...prev, [field]: isTouched }));
    };

    const validateForm = () => {
        const nextErrors = validate(values);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return useMemo(() => ({
        values,
        errors,
        touched,
        setValues,
        setErrors,
        setFieldValue,
        setFieldTouched,
        validateForm,
        resetForm,
    }), [values, errors, touched]);
}

export default useFormValidation;
