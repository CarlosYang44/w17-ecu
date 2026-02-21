import { useState, useEffect } from 'react';

export interface FocusSession {
    id: string;
    duration: number; // in seconds
    category: string; // e.g., 'Code', 'Research', 'Writing'
    description: string;
    timestamp: string;
}

export function useFocusTelemetry() {
    const [sessions, setSessions] = useState<FocusSession[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('ecu_focus_telemetry');
        if (stored) {
            try {
                setSessions(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse focus telemetry", e);
            }
        }
    }, []);

    const saveSession = (duration: number, category: string, description: string) => {
        const newSession: FocusSession = {
            id: Date.now().toString(),
            duration,
            category,
            description,
            timestamp: new Date().toISOString()
        };

        const updated = [newSession, ...sessions];
        setSessions(updated);
        localStorage.setItem('ecu_focus_telemetry', JSON.stringify(updated));
    };

    const getTotalDuration = () => {
        return sessions.reduce((acc, curr) => acc + curr.duration, 0);
    };

    const getStatsByCategory = () => {
        const stats: Record<string, number> = {};
        sessions.forEach(s => {
            stats[s.category] = (stats[s.category] || 0) + s.duration;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const clearSessions = () => {
        setSessions([]);
        localStorage.removeItem('ecu_focus_telemetry');
    };

    return { sessions, saveSession, getTotalDuration, getStatsByCategory, clearSessions };
}
