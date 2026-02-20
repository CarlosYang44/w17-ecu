import { useState, useEffect } from 'react';

export interface Objective {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'completed';
}

export function useRaceStrategy() {
    const [objectives, setObjectives] = useState<Objective[]>([]);

    useEffect(() => {
        // In a full Tauri/Electron app, we would use fs.watch on "Next Lap.md" here.
        // For this Web ECU iteration, we mock the local Obsidian file read via localStorage.

        const loadStrategy = () => {
            const stored = localStorage.getItem('w17_obsidian_strategy');
            if (stored) {
                setObjectives(JSON.parse(stored));
            } else {
                // Initial Mock Data (Representing Markdown Checklist items)
                const initialFocus: Objective[] = [
                    { id: '1', title: 'Prepare Dataset Infrastructure', status: 'completed' },
                    { id: '2', title: 'Deploy Transformer Evaluation Script', status: 'active' },
                    { id: '3', title: 'Compile Final Findings to R&D', status: 'pending' }
                ];
                localStorage.setItem('w17_obsidian_strategy', JSON.stringify(initialFocus));
                setObjectives(initialFocus);
            }
        };

        loadStrategy();

        // Listen for storage changes to simulate File Watcher cross-window reactivity
        window.addEventListener('storage', loadStrategy);
        return () => window.removeEventListener('storage', loadStrategy);
    }, []);

    const toggleObjectiveStatus = (id: string) => {
        setObjectives(prev => {
            const next = prev.map(obj => {
                if (obj.id === id) {
                    const nextStatus = obj.status === 'pending' ? 'active' :
                        obj.status === 'active' ? 'completed' : 'pending';
                    return { ...obj, status: nextStatus };
                }
                return obj;
            });
            localStorage.setItem('w17_obsidian_strategy', JSON.stringify(next));
            return next;
        });
    };

    return { objectives, toggleObjectiveStatus };
}
