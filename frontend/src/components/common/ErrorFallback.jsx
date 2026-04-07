import React from 'react';

export function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div role="alert" style={{ padding: 20 }}>
            <p>Something went wrong:</p>
            <pre>{error?.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    );
}
