import { useEffect, useMemo, useState } from 'react';

const REMEMBER_ME_DAYS = 30;

const getInitialExpiry = () => {
    const value = localStorage.getItem('session_expiry');
    return value ? new Date(value).getTime() : null;
};

export function useSession() {
    const [sessionExpiry, setSessionExpiry] = useState(getInitialExpiry);
    const [timeLeft, setTimeLeft] = useState(() => {
        const expiry = getInitialExpiry();
        return expiry ? Math.max(0, expiry - Date.now()) : 0;
    });

    useEffect(() => {
        if (!sessionExpiry) return undefined;

        const timer = window.setInterval(() => {
            setTimeLeft(Math.max(0, sessionExpiry - Date.now()));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [sessionExpiry]);

    return useMemo(() => ({
        sessionExpiry,
        timeLeft,
        rememberMeDays: REMEMBER_ME_DAYS,
        setSession(expiryIso) {
            localStorage.setItem('session_expiry', expiryIso);
            setSessionExpiry(new Date(expiryIso).getTime());
        },
        clearSession() {
            localStorage.removeItem('session_expiry');
            setSessionExpiry(null);
            setTimeLeft(0);
        },
    }), [sessionExpiry, timeLeft]);
}

export default useSession;
