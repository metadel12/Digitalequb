import { useState, useEffect, useCallback, useRef } from 'react';
import { compress, decompress } from 'lz-string';
import { isEqual } from 'lodash';

/**
 * Comprehensive localStorage hook with advanced features
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @param {Object} options - Configuration options
 * @param {boolean} options.compress - Enable compression for large data
 * @param {number} options.expires - Expiration time in milliseconds
 * @param {boolean} options.sync - Sync across tabs using storage event
 * @param {Function} options.serialize - Custom serializer
 * @param {Function} options.deserialize - Custom deserializer
 * @param {boolean} options.validate - Validate value before setting
 * @param {Function} options.onError - Error handler
 * @param {boolean} options.encrypt - Enable encryption (requires crypto)
 * @param {string} options.secret - Encryption secret
 */
const useLocalStorage = (key, initialValue, options = {}) => {
    const {
        compress: enableCompression = false,
        expires = null,
        sync = true,
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        validate = null,
        onError = (err) => console.error('localStorage error:', err),
        encrypt = false,
        secret = null,
        version = 1,
        migrate = null,
    } = options;

    const [value, setValue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const initialValueRef = useRef(initialValue);
    const keyRef = useRef(key);
    const versionRef = useRef(version);

    // Simple encryption/decryption (for demo - use a proper encryption library in production)
    const encryptData = useCallback((data, secretKey) => {
        if (!secretKey) return data;
        // Simple XOR encryption - NOT for production use
        // Use a proper encryption library like crypto-js in production
        const encoded = btoa(unescape(encodeURIComponent(data)));
        let encrypted = '';
        for (let i = 0; i < encoded.length; i++) {
            encrypted += String.fromCharCode(encoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        return btoa(encrypted);
    }, []);

    const decryptData = useCallback((encryptedData, secretKey) => {
        if (!secretKey) return encryptedData;
        try {
            const decoded = atob(encryptedData);
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
            }
            return decodeURIComponent(escape(atob(decrypted)));
        } catch {
            return null;
        }
    }, []);

    // Read from localStorage
    const readStorage = useCallback(() => {
        try {
            let item = localStorage.getItem(key);

            if (!item) {
                return { value: initialValueRef.current, metadata: null };
            }

            let parsed;
            if (enableCompression) {
                const decompressed = decompress(item);
                parsed = deserialize(decompressed);
            } else if (encrypt && secret) {
                const decrypted = decryptData(item, secret);
                parsed = deserialize(decrypted);
            } else {
                parsed = deserialize(item);
            }

            // Check if stored data has metadata (version, expiry)
            if (parsed && typeof parsed === 'object' && parsed.__metadata) {
                const { data, metadata } = parsed;

                // Check version compatibility
                if (metadata.version !== versionRef.current && migrate) {
                    const migratedData = migrate(data, metadata.version, versionRef.current);
                    return { value: migratedData, metadata: { ...metadata, version: versionRef.current } };
                }

                // Check expiration
                if (metadata.expires && Date.now() > metadata.expires) {
                    localStorage.removeItem(key);
                    return { value: initialValueRef.current, metadata: null };
                }

                return { value: data, metadata };
            }

            return { value: parsed, metadata: null };
        } catch (err) {
            onError(err);
            setError(err);
            return { value: initialValueRef.current, metadata: null };
        }
    }, [key, enableCompression, encrypt, secret, deserialize, decryptData, onError, migrate]);

    // Write to localStorage
    const writeStorage = useCallback((newValue, customOptions = {}) => {
        try {
            const {
                expires: customExpires = expires,
                compress: customCompress = enableCompression,
                encrypt: customEncrypt = encrypt,
            } = customOptions;

            let dataToStore = newValue;
            let metadata = {
                version: versionRef.current,
                timestamp: Date.now(),
            };

            if (customExpires) {
                metadata.expires = Date.now() + customExpires;
            }

            // Wrap data with metadata if we have any metadata
            if (Object.keys(metadata).length > 0) {
                dataToStore = { __metadata: metadata, data: newValue };
            }

            let serialized = serialize(dataToStore);

            if (customCompress) {
                serialized = compress(serialized);
            }

            if (customEncrypt && secret) {
                serialized = encryptData(serialized, secret);
            }

            localStorage.setItem(key, serialized);

            return true;
        } catch (err) {
            onError(err);
            setError(err);
            return false;
        }
    }, [key, expires, enableCompression, encrypt, secret, serialize, encryptData, onError]);

    // Set value with validation
    const setStoredValue = useCallback((newValue, customOptions = {}) => {
        // Handle function updates
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;

        // Validate if validator provided
        if (validate && !validate(valueToStore)) {
            const validationError = new Error('Validation failed');
            setError(validationError);
            onError(validationError);
            return false;
        }

        // Check for changes to avoid unnecessary writes
        if (isEqual(value, valueToStore)) {
            return true;
        }

        // Write to storage
        const success = writeStorage(valueToStore, customOptions);

        if (success) {
            setValue(valueToStore);
            setError(null);
        }

        return success;
    }, [value, validate, writeStorage, onError]);

    // Remove item
    const removeStoredValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setValue(initialValueRef.current);
            setError(null);
            return true;
        } catch (err) {
            onError(err);
            setError(err);
            return false;
        }
    }, [key, onError]);

    // Clear all localStorage (with optional prefix)
    const clearStorage = useCallback((prefix = null) => {
        try {
            if (prefix) {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                localStorage.clear();
            }
            setValue(initialValueRef.current);
            setError(null);
            return true;
        } catch (err) {
            onError(err);
            setError(err);
            return false;
        }
    }, [onError]);

    // Get all keys with optional prefix
    const getKeys = useCallback((prefix = null) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!prefix || key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        return keys;
    }, []);

    // Get storage info
    const getStorageInfo = useCallback(() => {
        let totalSize = 0;
        const items = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            items.push({ key, size, value: value.substring(0, 100) });
        }

        return {
            itemCount: localStorage.length,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            items,
        };
    }, []);

    // Sync across tabs
    useEffect(() => {
        if (!sync) return;

        const handleStorageChange = (e) => {
            if (e.key === key) {
                const { value: newValue } = readStorage();
                if (!isEqual(value, newValue)) {
                    setValue(newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, sync, readStorage, value]);

    // Initialize on mount
    useEffect(() => {
        const initialize = () => {
            try {
                const { value: storedValue, metadata } = readStorage();

                // Check if stored value exists
                if (storedValue !== undefined && storedValue !== null) {
                    setValue(storedValue);
                } else {
                    // Use initial value
                    setValue(initialValueRef.current);

                    // Write initial value if it's not the default
                    if (initialValueRef.current !== undefined && initialValueRef.current !== null) {
                        writeStorage(initialValueRef.current);
                    }
                }
                setLoading(false);
                setIsInitialized(true);
            } catch (err) {
                onError(err);
                setError(err);
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initialize();
    }, [readStorage, writeStorage, onError]);

    // Memoized API
    const api = {
        value,
        setValue: setStoredValue,
        remove: removeStoredValue,
        clear: clearStorage,
        getKeys,
        getStorageInfo,
        loading,
        error,
        isInitialized,
        exists: () => localStorage.getItem(key) !== null,
        getExpiry: () => {
            const item = localStorage.getItem(key);
            if (!item) return null;
            try {
                const parsed = deserialize(item);
                return parsed?.__metadata?.expires || null;
            } catch {
                return null;
            }
        },
        refresh: () => {
            const { value: newValue } = readStorage();
            setValue(newValue);
        },
    };

    return api;
};

// Hook for managing multiple localStorage values
export const useLocalStorageMulti = (keys, initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [loading, setLoading] = useState(true);
    const storages = {};

    keys.forEach(key => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const storage = useLocalStorage(key, initialValues[key]);
        storages[key] = storage;
    });

    useEffect(() => {
        const allLoaded = Object.values(storages).every(s => !s.loading);
        if (allLoaded) {
            const newValues = {};
            keys.forEach(key => {
                newValues[key] = storages[key].value;
            });
            setValues(newValues);
            setLoading(false);
        }
    }, [keys, storages]);

    const setValue = useCallback((key, newValue) => {
        if (storages[key]) {
            storages[key].setValue(newValue);
        }
    }, [storages]);

    const removeValue = useCallback((key) => {
        if (storages[key]) {
            storages[key].remove();
        }
    }, [storages]);

    return { values, setValue, removeValue, loading };
};

// Hook for watching localStorage changes
export const useLocalStorageWatcher = (key, callback) => {
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                let newValue = null;
                try {
                    newValue = JSON.parse(e.newValue);
                } catch {
                    newValue = e.newValue;
                }
                callback(newValue, e.oldValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, callback]);
};

// Hook for localStorage with migration support
export const useLocalStorageWithMigration = (key, initialValue, migrations = []) => {
    const migrate = useCallback((storedValue, storedVersion, currentVersion) => {
        let migratedValue = storedValue;
        let version = storedVersion;

        // Apply migrations in order
        for (let i = version; i < currentVersion; i++) {
            const migration = migrations[i];
            if (migration) {
                migratedValue = migration(migratedValue);
                version = i + 1;
            }
        }

        return migratedValue;
    }, [migrations]);

    return useLocalStorage(key, initialValue, { migrate, version: migrations.length });
};

// Hook for localStorage with expiration
export const useLocalStorageWithExpiry = (key, initialValue, ttl = 24 * 60 * 60 * 1000) => {
    return useLocalStorage(key, initialValue, { expires: ttl });
};

// Hook for encrypted localStorage
export const useLocalStorageEncrypted = (key, initialValue, secret) => {
    return useLocalStorage(key, initialValue, { encrypt: true, secret });
};

// Hook for compressed localStorage (for large data)
export const useLocalStorageCompressed = (key, initialValue) => {
    return useLocalStorage(key, initialValue, { compress: true });
};

// Utility functions
export const localStorageUtils = {
    // Get storage usage
    getStorageUsage: () => {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += (key.length + value.length) * 2; // UTF-16 characters are 2 bytes
        }
        return {
            bytes: total,
            kilobytes: (total / 1024).toFixed(2),
            megabytes: (total / (1024 * 1024)).toFixed(2),
        };
    },

    // Check if storage is available
    isStorageAvailable: () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },

    // Get all items with prefix
    getItemsWithPrefix: (prefix) => {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                try {
                    items[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    items[key] = localStorage.getItem(key);
                }
            }
        }
        return items;
    },

    // Remove items with prefix
    removeItemsWithPrefix: (prefix) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        return keys.length;
    },

    // Export all localStorage to JSON
    exportStorage: () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                data[key] = localStorage.getItem(key);
            }
        }
        return JSON.stringify(data, null, 2);
    },

    // Import localStorage from JSON
    importStorage: (jsonData, merge = true) => {
        try {
            const data = JSON.parse(jsonData);
            if (!merge) {
                localStorage.clear();
            }
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            });
            return true;
        } catch {
            return false;
        }
    },
};

// React component for localStorage debugger
export const LocalStorageDebugger = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const refreshItems = () => {
            const newItems = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                let value = localStorage.getItem(key);
                try {
                    value = JSON.parse(value);
                } catch {
                    // Keep as string
                }
                newItems.push({ key, value, size: new Blob([localStorage.getItem(key)]).size });
            }
            setItems(newItems);
        };

        refreshItems();
        window.addEventListener('storage', refreshItems);
        return () => window.removeEventListener('storage', refreshItems);
    }, []);

    const filteredItems = items.filter(item =>
        item.key.toLowerCase().includes(search.toLowerCase())
    );

    const totalSize = filteredItems.reduce((sum, item) => sum + item.size, 0);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6">LocalStorage Debugger</Typography>
            <Typography variant="body2" color="text.secondary">
                Total: {filteredItems.length} items | {Math.round(totalSize / 1024)} KB
            </Typography>

            <TextField
                size="small"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
            />

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.key}>
                                <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                        {item.key}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'auto' }}>
                                        {typeof item.value === 'object'
                                            ? JSON.stringify(item.value).substring(0, 100)
                                            : String(item.value).substring(0, 100)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">{item.size} B</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            localStorage.removeItem(item.key);
                                            const newItems = items.filter(i => i.key !== item.key);
                                            setItems(newItems);
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default useLocalStorage;