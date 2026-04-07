import { useMemo } from 'react';
import { useWebSocket as useWebSocketContext } from '../context/WebSocketContext';

export const useWebSocket = () => {
    const context = useWebSocketContext?.() || {};

    return useMemo(() => ({
        socket: context.socket || null,
        subscribe: context.subscribe || (() => () => {}),
        unsubscribe: context.unsubscribe || (() => {}),
        sendMessage: context.sendMessage || (() => false),
        isConnected: Boolean(context.socket),
    }), [context]);
};

export default useWebSocket;
