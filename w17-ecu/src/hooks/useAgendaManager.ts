import { useState, useEffect } from 'react';

export interface AgendaItem {
    id: string;
    title: string;
    status: 'active' | 'completed';
    createdAt: number;
}

export function useAgendaManager() {
    const [objectives, setObjectives] = useState<AgendaItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('ecu_agenda_v1');
        if (stored) {
            try {
                setObjectives(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse agenda telemetry", e);
            }
        } else if (localStorage.getItem('ecu_agenda_cleared') !== 'true') {
            // Default initial states only if never explicitly cleared
            setObjectives([
                { id: '1', title: 'Compile Final Findings to R&D', status: 'active', createdAt: Date.now() - 10000 },
                { id: '2', title: 'Prepare Dataset Infrastructure', status: 'completed', createdAt: Date.now() - 50000 }
            ]);
        }
    }, []);

    // Save to local storage whenever objectives change
    useEffect(() => {
        localStorage.setItem('ecu_agenda_v1', JSON.stringify(objectives));
    }, [objectives]);

    const toggleObjectiveStatus = (id: string) => {
        setObjectives(prev =>
            prev.map(obj =>
                obj.id === id
                    ? { ...obj, status: (obj.status === 'active' ? 'completed' : 'active') as 'active' | 'completed' }
                    : obj
            ).sort((a, b) => {
                // Active tasks bubble up, completed tasks sink down
                if (a.status === 'active' && b.status === 'completed') return -1;
                if (a.status === 'completed' && b.status === 'active') return 1;
                return b.createdAt - a.createdAt; // Newer items first within same status
            })
        );
    };

    const addObjective = (title: string) => {
        if (!title.trim()) return;
        const newObj: AgendaItem = {
            id: Date.now().toString(),
            title: title.trim(),
            status: 'active',
            createdAt: Date.now()
        };
        setObjectives(prev => [newObj, ...prev]);
    };

    const deleteObjective = (id: string) => {
        setObjectives(prev => prev.filter(obj => obj.id !== id));
    };

    const clearAgenda = () => {
        setObjectives([]);
        localStorage.removeItem('ecu_agenda_v1');
        localStorage.setItem('ecu_agenda_cleared', 'true');
    };

    return { objectives, toggleObjectiveStatus, addObjective, deleteObjective, clearAgenda };
}
