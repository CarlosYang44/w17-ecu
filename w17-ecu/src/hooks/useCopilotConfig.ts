import { useState, useEffect } from 'react';

export interface CopilotConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

const DEFAULT_CONFIG: CopilotConfig = {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
};

export function useCopilotConfig() {
    const [config, setConfig] = useState<CopilotConfig>(() => {
        try {
            const saved = localStorage.getItem('ecu_copilot_config');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load Copilot config', e);
        }
        return DEFAULT_CONFIG;
    });

    const [isConfigOpen, setIsConfigOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('ecu_copilot_config', JSON.stringify(config));
    }, [config]);

    const updateConfig = (updates: Partial<CopilotConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    return { config, updateConfig, isConfigOpen, setIsConfigOpen };
}
