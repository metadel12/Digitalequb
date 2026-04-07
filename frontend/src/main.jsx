import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { UIProvider } from './context/UIContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ErrorFallback } from './components/common/ErrorFallback';
import { LoadingScreen } from './components/common/LoadingScreen';
import { registerServiceWorker } from './utils/serviceWorker';
import { initAnalytics } from './utils/analytics';
import './assets/styles/globals.css';
import './assets/styles/animations.css';

// ==================== QUERY CLIENT CONFIGURATION ====================

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            suspense: false,
            useErrorBoundary: false,
        },
        mutations: {
            retry: 1,
            retryDelay: 1000,
            useErrorBoundary: false,
        },
    },
});

// ==================== ERROR HANDLER ====================

const handleError = (error, errorInfo) => {
    console.error('Application Error:', error, errorInfo);

    // Log to error tracking service in production
    if (import.meta.env.PROD) {
        // Example: Send to Sentry or other error tracking service
        // Sentry.captureException(error, { extra: errorInfo });

        // Log to analytics
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: true,
            });
        }
    }
};

// ==================== PERFORMANCE MARKING ====================

if (import.meta.env.DEV) {
    // Mark app start for performance monitoring
    performance.mark('app-start');
}

// ==================== SERVICE WORKER REGISTRATION ====================

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    registerServiceWorker();
}

// ==================== ANALYTICS INITIALIZATION ====================

initAnalytics();

// ==================== WALLET ERROR GUARD ====================

window.addEventListener('unhandledrejection', (event) => {
    const message = event?.reason?.message || String(event?.reason || '');

    if (
        message.includes('MetaMask extension not found') ||
        message.includes('Failed to connect to MetaMask')
    ) {
        console.warn('Wallet connection skipped: MetaMask extension is not available.');
        event.preventDefault();
    }
});

// ==================== ROOT RENDER FUNCTION ====================

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => {
    root.render(
        <React.StrictMode>
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onError={handleError}
                onReset={() => {
                    // Reset the state of your app so the error doesn't happen again
                    window.location.href = '/';
                }}
            >
                <BrowserRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <HelmetProvider>
                        <QueryClientProvider client={queryClient}>
                            <ThemeProvider>
                                <LanguageProvider>
                                    <UIProvider>
                                        <AuthProvider>
                                            <NotificationProvider>
                                                <WebSocketProvider>
                                                    <React.Suspense fallback={<LoadingScreen />}>
                                                        <App />
                                                        <Toaster
                                                            position="top-right"
                                                            toastOptions={{
                                                                duration: 5000,
                                                                style: {
                                                                    background: '#363636',
                                                                    color: '#fff',
                                                                    borderRadius: '8px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 500,
                                                                },
                                                                success: {
                                                                    duration: 3000,
                                                                    iconTheme: {
                                                                        primary: '#10b981',
                                                                        secondary: '#fff',
                                                                    },
                                                                    style: {
                                                                        background: '#10b981',
                                                                        color: '#fff',
                                                                    },
                                                                },
                                                                error: {
                                                                    duration: 5000,
                                                                    iconTheme: {
                                                                        primary: '#ef4444',
                                                                        secondary: '#fff',
                                                                    },
                                                                    style: {
                                                                        background: '#ef4444',
                                                                        color: '#fff',
                                                                    },
                                                                },
                                                                loading: {
                                                                    duration: Infinity,
                                                                    style: {
                                                                        background: '#3b82f6',
                                                                        color: '#fff',
                                                                    },
                                                                },
                                                            }}
                                                            containerStyle={{
                                                                top: 20,
                                                                right: 20,
                                                                bottom: 20,
                                                                left: 20,
                                                            }}
                                                            gutter={8}
                                                        />
                                                    </React.Suspense>
                                            </WebSocketProvider>
                                        </NotificationProvider>
                                    </AuthProvider>
                                </UIProvider>
                            </LanguageProvider>
                        </ThemeProvider>
                        {/* Analytics for production */}
                        {import.meta.env.PROD && (
                            <>
                                <Analytics />
                                <SpeedInsights />
                            </>
                        )}
                    </QueryClientProvider>
                </HelmetProvider>
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
};

// ==================== PERFORMANCE MONITORING ====================

if (import.meta.env.DEV) {
    // Mark app render complete
    performance.mark('app-render');
    performance.measure('app-start-to-render', 'app-start', 'app-render');

    // Log performance marks
    const measures = performance.getEntriesByType('measure');
    console.table(measures.map(m => ({ name: m.name, duration: m.duration })));
}

// ==================== INITIAL RENDER ====================

renderApp();

// ==================== HOT MODULE RELOADING (Development) ====================

if (import.meta.hot) {
    import.meta.hot.accept('./App', () => {
        renderApp();
    });
}

// ==================== EXPORT FOR TESTING ====================

export { queryClient };
