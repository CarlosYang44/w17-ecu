import { useState, useEffect } from 'react';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    performanceGain: number; // 0 to 10
    timestamp: string;
}

export function useFinancialTelemetry() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const loadTransactions = () => {
            const stored = localStorage.getItem('w17_financial_telemetry');
            if (stored) {
                let parsed: Transaction[] = JSON.parse(stored);
                const hasOldDefaults = parsed.some(t => t.id === '1' || t.id === '2');
                if (hasOldDefaults) {
                    parsed = parsed.filter(t => t.id !== '1' && t.id !== '2');
                    localStorage.setItem('w17_financial_telemetry', JSON.stringify(parsed));
                }
                setTransactions(parsed);
            } else {
                // Initial Mock Data
                const initialFocus: Transaction[] = [];
                localStorage.setItem('w17_financial_telemetry', JSON.stringify(initialFocus));
                setTransactions(initialFocus);
            }
        };

        loadTransactions();
    }, []);

    const addTransaction = (amount: number, description: string, performanceGain: number) => {
        const newTx: Transaction = {
            id: Date.now().toString(),
            amount,
            description,
            performanceGain,
            timestamp: new Date().toISOString()
        };

        setTransactions(prev => {
            const next = [newTx, ...prev];
            localStorage.setItem('w17_financial_telemetry', JSON.stringify(next));
            return next;
        });
    };

    const calculateROI = () => {
        if (transactions.length === 0) return 0;
        const totalGain = transactions.reduce((acc, t) => acc + t.performanceGain, 0);
        const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
        if (totalSpent === 0) return 0;
        return (totalGain / totalSpent).toFixed(2);
    };

    const clearTransactions = () => {
        setTransactions([]);
        localStorage.removeItem('w17_financial_telemetry');
    };

    return { transactions, addTransaction, calculateROI, clearTransactions };
}
