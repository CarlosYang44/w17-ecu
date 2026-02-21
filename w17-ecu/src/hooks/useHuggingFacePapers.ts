import { useState, useEffect } from 'react';

export interface HFPaper {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    guid: string;
    creator: string;
    upvotes: number;
}

export function useHuggingFacePapers() {
    const [papers, setPapers] = useState<HFPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPapers = async () => {
            setLoading(true);
            try {
                // Use today's date (local timezone) to fetch daily papers
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

                // Try today first, if empty fall back to yesterday
                let data = await fetchByDate(dateStr);
                if (!data || data.length === 0) {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    data = await fetchByDate(yesterdayStr);
                }

                const formattedPapers = (data || []).map((item: any) => ({
                    title: item.paper.title || 'Unknown Title',
                    link: `https://huggingface.co/papers/${item.paper.id}`,
                    pubDate: item.publishedAt || new Date().toISOString(),
                    contentSnippet: item.paper.summary || '',
                    guid: item.paper.id || Date.now().toString(),
                    creator: item.paper.authors
                        ? item.paper.authors.map((a: any) => a.name).join(', ')
                        : 'HF Community',
                    upvotes: item.paper.upvotes || 0,
                }));

                setPapers(formattedPapers);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Sensor failure reading HF flux');
                console.error("HF Lab Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    return { papers, loading, error };
}

async function fetchByDate(dateStr: string): Promise<any[]> {
    const response = await fetch(
        `https://huggingface.co/api/daily_papers?date=${dateStr}`,
        { cache: 'no-store' }
    );
    if (!response.ok) {
        throw new Error(`Sensor failure with status: ${response.status}`);
    }
    return response.json();
}
