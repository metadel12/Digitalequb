import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';

const META_MASK_MISSING_ERROR = 'MetaMask extension not found. Please install MetaMask and try again.';

const getEthereumProvider = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    if (window.ethereum?.providers?.length) {
        const metaMaskProvider = window.ethereum.providers.find((provider) => provider?.isMetaMask);
        return metaMaskProvider || window.ethereum;
    }

    return window.ethereum || null;
};

const normalizeWalletError = (error) => {
    const message = error?.message || '';

    if (
        message.includes('MetaMask extension not found') ||
        message.includes('Failed to connect to MetaMask') ||
        message.includes('No Ethereum provider')
    ) {
        return META_MASK_MISSING_ERROR;
    }

    if (error?.code === 4001) {
        return 'Wallet connection request was rejected.';
    }

    return message || 'Unable to connect wallet right now.';
};

export const useWeb3 = () => {
    const [provider, setProvider] = useState(() => getEthereumProvider());
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const web3 = useMemo(() => {
        if (!provider) {
            return null;
        }

        return new Web3(provider);
    }, [provider]);

    const syncAccounts = useCallback(async (ethereumProvider) => {
        if (!ethereumProvider?.request) {
            setAccount(null);
            setIsConnected(false);
            return;
        }

        try {
            const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
            const nextAccount = accounts?.[0] || null;
            setAccount(nextAccount);
            setIsConnected(Boolean(nextAccount));
        } catch (syncError) {
            setAccount(null);
            setIsConnected(false);
            setError(normalizeWalletError(syncError));
        }
    }, []);

    const connectWallet = useCallback(async () => {
        const ethereumProvider = getEthereumProvider();
        setProvider(ethereumProvider);
        setError(null);

        if (!ethereumProvider?.request) {
            const missingError = new Error(META_MASK_MISSING_ERROR);
            setIsConnected(false);
            setAccount(null);
            setError(missingError.message);
            return { success: false, error: missingError.message };
        }

        setIsConnecting(true);
        try {
            const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
            const selectedAccount = accounts?.[0] || null;
            const selectedChain = await ethereumProvider.request({ method: 'eth_chainId' });

            setAccount(selectedAccount);
            setChainId(selectedChain || null);
            setIsConnected(Boolean(selectedAccount));

            if (!selectedAccount) {
                return { success: false, error: 'No account returned from wallet.' };
            }

            return { success: true, account: selectedAccount, chainId: selectedChain || null };
        } catch (connectError) {
            const normalizedError = normalizeWalletError(connectError);
            setError(normalizedError);
            setAccount(null);
            setIsConnected(false);
            return { success: false, error: normalizedError };
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setIsConnected(false);
        setChainId(null);
        setError(null);
    }, []);

    useEffect(() => {
        const ethereumProvider = getEthereumProvider();
        setProvider(ethereumProvider);

        if (!ethereumProvider) {
            return undefined;
        }

        syncAccounts(ethereumProvider);

        const onAccountsChanged = (accounts) => {
            const nextAccount = accounts?.[0] || null;
            setAccount(nextAccount);
            setIsConnected(Boolean(nextAccount));
            if (!nextAccount) {
                setChainId(null);
            }
        };

        const onChainChanged = (nextChainId) => {
            setChainId(nextChainId || null);
        };

        ethereumProvider.on?.('accountsChanged', onAccountsChanged);
        ethereumProvider.on?.('chainChanged', onChainChanged);

        return () => {
            ethereumProvider.removeListener?.('accountsChanged', onAccountsChanged);
            ethereumProvider.removeListener?.('chainChanged', onChainChanged);
        };
    }, [syncAccounts]);

    return {
        web3,
        provider,
        account,
        chainId,
        isConnected,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
    };
};

