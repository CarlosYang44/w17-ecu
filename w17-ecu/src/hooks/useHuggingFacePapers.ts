import { useState, useEffect } from 'react';

export interface HFPaper {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    guid: string;
    creator: string;
}

export function useHuggingFacePapers() {
    const [papers, setPapers] = useState<HFPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPapers = async () => {
            setLoading(true);
            try {
                // Direct Native JSON Fetch - no CORS proxy required
                const response = await fetch("https://huggingface.co/api/daily_papers", {
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`Sensor failure with status: ${response.status}`);
                }

                const data = await response.json();

                const formattedPapers = data.map((item: any) => ({
                    title: item.paper.title || 'Unknown Title',
                    link: `https://huggingface.co/papers/${item.paper.id}`,
                    pubDate: item.publishedAt || new Date().toISOString(),
                    contentSnippet: item.paper.summary || '',
                    guid: item.paper.id || Date.now().toString(),
                    // Combine authors into a string
                    creator: item.paper.authors ? item.paper.authors.map((a: any) => a.name).join(', ') : 'HF Community'
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
