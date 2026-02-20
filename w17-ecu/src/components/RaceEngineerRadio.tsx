import React, { useState, useEffect } from 'react';
import { Radio, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function RaceEngineerRadio({ message, priority = 'medium', isVisible, onDismiss }: { message: string, priority?: 'soft' | 'medium' | 'hard', isVisible: boolean, onDismiss?: () => void }) {
    if (!isVisible && !message) return null;

    return (
        <div
            className={cn(
                "fixed bottom-xl right-xl z-50 flex items-start gap-md max-w-sm",
                "bg-[#1A1A1A]/95 backdrop-blur-md border",
                "p-md shadow-lg transition-fluid transform",
                isVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0",
                {
                    'border-[#FF2800]': priority === 'soft',
                    'border-[#FFD700]': priority === 'medium',
                    'border-[#FFFFFF]': priority === 'hard',
                }
            )}
            style={{
                borderRadius: 'var(--border-radius-md)',
                boxShadow: `0 4px 24px -4px ${priority === 'soft' ? 'rgba(255,40,0,0.2)' : priority === 'medium' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)'}`
            }}
        >
            <div className="flex-shrink-0 mt-0.5 animate-pulse">
                <Radio
                    size={20}
                    color={
                        priority === 'soft' ? 'var(--color-status-soft)' :
                            priority === 'medium' ? 'var(--color-status-medium)' :
                                'var(--color-status-hard)'
                    }
                />
            </div>
            <div className="flex-1">
                <div className="text-xs uppercase tracking-widest font-mono text-gray-500 mb-1 flex items-center justify-between gap-4">
                    <span>Bono (Race Engineer)</span>
                    {onDismiss && (
                        <button onClick={onDismiss} className="text-[#888] hover:text-[#FF2800] transition-colors p-1" title="Dismiss">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <p className="text-sm text-[#E6E6E6] font-mono leading-relaxed">
                    "{message}"
                </p>
            </div>
        </div>
    );
}
