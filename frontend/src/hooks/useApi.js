import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

// Configuration options
const DEFAULT_CONFIG = {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 30000,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    showErrorToast: true,
    showSuccessToast: false,
    onError: null,
    onSuccess: null,
};

// Cache storage
const cache = new Map();

// Request cancellation controller
const abortControllers = new Map();

/**
 * Advanced API hook with caching, retry logic, request cancellation, and more
 */
const useApi = (options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [progress, setProgress] = useState(0);
    const [responseTime, setResponseTime] = useState(null);

    const config = { ...DEFAULT_CONFIG, ...options };
    const abortControllerRef = useRef(null);
    const requestIdRef = useRef(null);
    const retryCountRef = useRef(0);
    const startTimeRef = useRef(null);

    // Optional snackbar integration
    let enqueueSnackbar;
    try {
        enqueueSnackbar = useSnackbar?.().enqueueSnackbar;
    } catch (e) {
        // Snackbar not available
    }

    // Clear cache for a specific key
    const clearCache = useCallback((cacheKey) => {
        if (cacheKey) {
            cache.delete(cacheKey);
        } else {
            cache.clear();
        }
    }, []);

    // Cancel current request
    const cancelRequest = useCallback((reason = 'Request cancelled') => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(reason);
            abortControllerRef.current = null;
        }
        setStatus('idle');
        setLoading(false);
    }, []);

    // Show toast notification
    const showToast = useCallback((message, variant = 'info') => {
        if (enqueueSnackbar) {
            enqueueSnackbar(message, { variant });
        } else {
            console.log(`[${variant.toUpperCase()}]`, message);
        }
    }, [enqueueSnackbar]);

    // Handle error
    const handleError = useCallback((err, context = {}) => {
        let errorMessage = 'An unexpected error occurred';
        let errorCode = null;
        let errorDetails = null;

        if (axios.isCancel(err)) {
            errorMessage = 'Request cancelled';
            errorCode = 'CANCELLED';
        } else if (err.response) {
            // Server responded with error status
            errorCode = err.response.status;
            errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${errorCode}`;
            errorDetails = err.response.data;

            // Handle specific status codes
            switch (errorCode) {
                case 401:
                    errorMessage = 'Unauthorized. Please login again.';
                    break;
                case 403:
                    errorMessage = 'You do not have permission to perform this action.';
                    break;
                case 404:
                    errorMessage = 'Resource not found.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    break;
                default:
                    break;
            }
        } else if (err.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.';
            errorCode = 'NETWORK_ERROR';
        } else {
            // Something else happened
            errorMessage = err.message || errorMessage;
        }

        setError({ message: errorMessage, code: errorCode, details: errorDetails });
        setStatus('error');

        if (config.showErrorToast) {
            showToast(errorMessage, 'error');
        }

        if (config.onError) {
            config.onError(err, context);
        }

        return { error: true, message: errorMessage, code: errorCode };
    }, [config.showErrorToast, config.onError, showToast]);

    // Handle success
    const handleSuccess = useCallback((response, context = {}) => {
        const responseData = response.data || response;
        setData(responseData);
        setStatus('success');
        setError(null);

        const responseTimeMs = startTimeRef.current ? Date.now() - startTimeRef.current : null;
        setResponseTime(responseTimeMs);

        if (config.showSuccessToast) {
            showToast('Request completed successfully', 'success');
        }

        if (config.onSuccess) {
            config.onSuccess(responseData, context);
        }

        return { success: true, data: responseData, responseTime: responseTimeMs };
    }, [config.showSuccessToast, config.onSuccess, showToast]);

    // Execute API call with retry logic
    const execute = useCallback(async (apiCall, executeOptions = {}) => {
        const {
            cacheKey = null,
            useCache = false,
            retryCount = config.retryCount,
            retryDelay = config.retryDelay,
            timeout = config.timeout,
            onUploadProgress = null,
            onDownloadProgress = null,
            showLoading = true,
            skipErrorHandling = false,
            context = {},
        } = executeOptions;

        // Check cache
        if (useCache && cacheKey && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (cached.expiry > Date.now()) {
                setData(cached.data);
                setStatus('success');
                setError(null);
                return { success: true, data: cached.data, fromCache: true };
            } else {
                cache.delete(cacheKey);
            }
        }

        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const requestId = Date.now() + Math.random();
        requestIdRef.current = requestId;
        abortControllers.set(requestId, abortController);

        // Set loading state
        if (showLoading) {
            setLoading(true);
            setStatus('loading');
        }
        setError(null);
        setProgress(0);
        startTimeRef.current = Date.now();

        let retries = 0;

        const executeWithRetry = async () => {
            try {
                // Set timeout
                const timeoutId = setTimeout(() => {
                    abortController.abort();
                }, timeout);

                const result = await apiCall({
                    signal: abortController.signal,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                        if (onUploadProgress) onUploadProgress(progressEvent);
                    },
                    onDownloadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                        if (onDownloadProgress) onDownloadProgress(progressEvent);
                    },
                });

                clearTimeout(timeoutId);

                // Check if this is still the latest request
                if (requestIdRef.current !== requestId) {
                    return null;
                }

                // Handle success
                const successResult = handleSuccess(result, context);

                // Cache result if requested
                if (useCache && cacheKey) {
                    cache.set(cacheKey, {
                        data: successResult.data,
                        expiry: Date.now() + config.cacheTime,
                        timestamp: Date.now(),
                    });
                }

                if (showLoading) {
                    setLoading(false);
                }

                abortControllers.delete(requestId);
                abortControllerRef.current = null;

                return successResult;
            } catch (err) {
                // Check if this is still the latest request
                if (requestIdRef.current !== requestId) {
                    return null;
                }

                // Handle retry logic
                if (axios.isAxiosError(err) && retries < retryCount) {
                    const status = err.response?.status;
                    // Retry on network errors or 5xx server errors
                    if (!err.response || (status >= 500 && status < 600)) {
                        retries++;
                        const delay = retryDelay * Math.pow(2, retries - 1); // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return executeWithRetry();
                    }
                }

                // Handle error
                if (!skipErrorHandling) {
                    handleError(err, context);
                }

                if (showLoading) {
                    setLoading(false);
                }

                abortControllers.delete(requestId);
                abortControllerRef.current = null;

                return { error: true, message: err.message, code: err.response?.status };
            }
        };

        return executeWithRetry();
    }, [config.retryCount, config.retryDelay, config.timeout, config.cacheTime, handleSuccess, handleError]);

    // Execute GET request
    const get = useCallback((url, options = {}) => {
        return execute(async (requestOptions) => {
            const response = await axios.get(url, { ...requestOptions, ...options });
            return response;
        }, options);
    }, [execute]);

    // Execute POST request
    const post = useCallback((url, data, options = {}) => {
        return execute(async (requestOptions) => {
            const response = await axios.post(url, data, { ...requestOptions, ...options });
            return response;
        }, options);
    }, [execute]);

    // Execute PUT request
    const put = useCallback((url, data, options = {}) => {
        return execute(async (requestOptions) => {
            const response = await axios.put(url, data, { ...requestOptions, ...options });
            return response;
        }, options);
    }, [execute]);

    // Execute PATCH request
    const patch = useCallback((url, data, options = {}) => {
        return execute(async (requestOptions) => {
            const response = await axios.patch(url, data, { ...requestOptions, ...options });
            return response;
        }, options);
    }, [execute]);

    // Execute DELETE request
    const del = useCallback((url, options = {}) => {
        return execute(async (requestOptions) => {
            const response = await axios.delete(url, { ...requestOptions, ...options });
            return response;
        }, options);
    }, [execute]);

    // Upload file
    const upload = useCallback((url, file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        if (options.fields) {
            Object.entries(options.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        return execute(async (requestOptions) => {
            const response = await axios.post(url, formData, {
                ...requestOptions,
                headers: { 'Content-Type': 'multipart/form-data', ...options.headers },
            });
            return response;
        }, { ...options, showProgress: true });
    }, [execute]);

    // Download file
    const download = useCallback(async (url, filename, options = {}) => {
        const response = await execute(async (requestOptions) => {
            const res = await axios.get(url, {
                ...requestOptions,
                responseType: 'blob',
                ...options,
            });
            return res;
        }, options);

        if (response.success && response.data) {
            const blob = response.data;
            const link = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        }

        return response;
    }, [execute]);

    // Clear all data
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setStatus('idle');
        setLoading(false);
        setProgress(0);
        setResponseTime(null);
        cancelRequest();
    }, [cancelRequest]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Memoized return value
    const api = useMemo(() => ({
        // State
        loading,
        error,
        data,
        status,
        progress,
        responseTime,

        // Methods
        execute,
        get,
        post,
        put,
        patch,
        delete: del,
        upload,
        download,
        cancel: cancelRequest,
        reset,
        clearCache,
    }), [
        loading,
        error,
        data,
        status,
        progress,
        responseTime,
        execute,
        get,
        post,
        put,
        patch,
        del,
        upload,
        download,
        cancelRequest,
        reset,
        clearCache,
    ]);

    return api;
};

// Pre-configured hooks for common use cases
export const useLazyApi = (options = {}) => {
    const api = useApi({ ...options, showLoading: false });
    return api;
};

export const useMutation = (options = {}) => {
    const api = useApi({ ...options, showSuccessToast: true });
    return {
        mutate: api.post,
        loading: api.loading,
        error: api.error,
        data: api.data,
        reset: api.reset,
    };
};

export const useQuery = (key, fetcher, options = {}) => {
    const api = useApi(options);

    useEffect(() => {
        if (fetcher) {
            api.execute(fetcher, { cacheKey: key, useCache: options.useCache !== false });
        }
    }, [key, fetcher]);

    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        refetch: () => api.execute(fetcher, { cacheKey: key, useCache: false }),
        reset: api.reset,
    };
};

// API service interceptor setup
export const setupApiInterceptors = (onUnauthorized, onRefreshToken) => {
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        failedQueue = [];
    };

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axios(originalRequest);
                        })
                        .catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const newToken = await onRefreshToken();
                    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return axios(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    if (onUnauthorized) onUnauthorized();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};

// Custom error class for API errors
export class ApiError extends Error {
    constructor(message, statusCode, data = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
    }
}

// Helper function to create API service
export const createApiService = (baseURL, options = {}) => {
    const instance = axios.create({
        baseURL,
        timeout: options.timeout || 30000,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response) {
                const apiError = new ApiError(
                    error.response.data?.message || 'API request failed',
                    error.response.status,
                    error.response.data
                );
                return Promise.reject(apiError);
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export default useApi;