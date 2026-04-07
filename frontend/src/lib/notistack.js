import React from 'react';
import toast from 'react-hot-toast';

const variantMap = {
    success: toast.success,
    error: toast.error,
    warning: toast,
    info: toast,
    default: toast,
};

export const enqueueSnackbar = (message, options = {}) => {
    const handler = variantMap[options.variant] || toast;
    return handler(message, {
        id: options.key,
        duration: options.persist ? Infinity : options.autoHideDuration,
    });
};

export const closeSnackbar = (id) => {
    if (id) {
        toast.dismiss(id);
        return;
    }
    toast.dismiss();
};

export const SnackbarProvider = ({ children }) => children ?? null;

export const useSnackbar = () => ({
    enqueueSnackbar,
    closeSnackbar,
});
