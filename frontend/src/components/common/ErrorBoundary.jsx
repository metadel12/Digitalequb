import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

export function ErrorBoundary(props) {
    return <ReactErrorBoundary {...props} />;
}

export default ErrorBoundary;
