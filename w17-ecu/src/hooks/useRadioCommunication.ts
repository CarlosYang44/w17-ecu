import { useState, useEffect } from 'react';

export function useRadioCommunication() {
    const [activeMessage, setActiveMessage] = useState<{ id: string, text: string, priority: 'soft' | 'medium' | 'hard', autoDismiss: boolean } | null>(null);

    const sendMessage = (text: string, priority: 'soft' | 'medium' | 'hard' = 'medium', autoDismiss: boolean = true) => {
        setActiveMessage({ id: Date.now().toString(), text, priority, autoDismiss });
    };

    const clearMessage = () => setActiveMessage(null);

    useEffect(() => {
        if (activeMessage && activeMessage.autoDismiss) {
            const timer = setTimeout(() => {
                setActiveMessage(prev => prev?.id === activeMessage.id ? null : prev);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [activeMessage]);

    return { activeMessage, sendMessage, clearMessage };
}
