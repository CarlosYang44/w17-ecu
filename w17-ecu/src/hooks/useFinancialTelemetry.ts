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
                setTransactions(JSON.parse(stored));
            } else {
                // Initial Mock Data
                const initialFocus: Transaction[] = [
                    { id: '1', amount: 15.00, description: 'OpenAI API Usage', performanceGain: 9, timestamp: new Date(Date.now() - 86400000).toISOString() },
                    { id: '2', amount: 4.50, description: 'Coffee', performanceGain: 5, timestamp: new Date(Date.now() - 40000000).toISOString() }
                ];
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
