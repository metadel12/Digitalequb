import { useMemo, useState } from 'react';

export function useFormValidation(initialValues, validate) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const setFieldValue = (field, value) => {
        setValues((prev) => {
            const next = { ...prev, [field]: value };
            // re-validate touched fields live as user types
            setErrors(validate(next));
            return next;
        });
    };

    const setFieldTouched = (field, isTouched = true) => {
        setTouched((prev) => ({ ...prev, [field]: isTouched }));
        // validate immediately when field is blurred
        setErrors((prev) => ({ ...prev, ...validate(values) }));
    };

    const validateForm = () => {
        const nextErrors = validate(values);
        setErrors(nextErrors);
        const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setTouched(allTouched);
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
