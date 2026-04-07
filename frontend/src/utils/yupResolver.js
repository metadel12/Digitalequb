export const setNestedError = (target, path, value) => {
    const keys = path.split('.');
    let cursor = target;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            cursor[key] = value;
            return;
        }

        if (!cursor[key]) {
            cursor[key] = {};
        }

        cursor = cursor[key];
    });
};

export const yupResolver = (validationSchema) => async (values) => {
    try {
        const parsedValues = await validationSchema.validate(values, {
            abortEarly: false,
            stripUnknown: false,
        });

        return {
            values: parsedValues,
            errors: {},
        };
    } catch (error) {
        const formErrors = {};

        error.inner.forEach((issue) => {
            if (!issue.path) {
                return;
            }

            setNestedError(formErrors, issue.path, {
                type: issue.type || 'validation',
                message: issue.message,
            });
        });

        return {
            values: {},
            errors: formErrors,
        };
    }
};

export default yupResolver;
