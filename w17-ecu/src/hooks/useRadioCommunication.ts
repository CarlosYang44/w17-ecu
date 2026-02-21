import { useState, useEffect, useRef } from 'react';

interface RadioMessage {
    id: string;
    text: string;
    priority: 'soft' | 'medium' | 'hard';
    autoDismiss: boolean;
}

export function useRadioCommunication() {
    const [activeMessage, setActiveMessage] = useState<RadioMessage | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const dismissedIdRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sendMessage = (text: string, priority: 'soft' | 'medium' | 'hard' = 'medium', autoDismiss: boolean = true) => {
        const newId = Date.now().toString();
        // Clear any pending auto-dismiss timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setActiveMessage({ id: newId, text, priority, autoDismiss });
        setIsVisible(true);
        dismissedIdRef.current = null;

        if (autoDismiss) {
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                timerRef.current = null;
            }, 5000);
        }
    };

    const clearMessage = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (activeMessage) {
            dismissedIdRef.current = activeMessage.id;
        }
        setIsVisible(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { activeMessage, isVisible, sendMessage, clearMessage };
}
