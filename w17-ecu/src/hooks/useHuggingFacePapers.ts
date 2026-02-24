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

/** Get local date string YYYY-MM-DD (avoids UTC shift from toISOString) */
function getLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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

function formatPapers(data: any[]): HFPaper[] {
    return (data || []).map((item: any) => ({
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
}

export function useHuggingFacePapers() {
    const [dailyPapers, setDailyPapers] = useState<HFPaper[]>([]);
    const [weeklyPapers, setWeeklyPapers] = useState<HFPaper[]>([]);
    const [dailyDate, setDailyDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPapers = async () => {
            setLoading(true);
            try {
                const today = new Date();

                // --- Daily: loop back up to 7 days to find the first date with papers ---
                let dailyData: any[] = [];
                let foundDateStr = '';
                for (let i = 0; i < 7; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const dateStr = getLocalDateStr(d);
                    try {
                        const data = await fetchByDate(dateStr);
                        if (data && data.length > 0) {
                            dailyData = data;
                            foundDateStr = dateStr;
                            break;
                        }
                    } catch {
                        // Date may be rejected by API (e.g. local TZ ahead of UTC)
                        continue;
                    }
                }

                setDailyPapers(formatPapers(dailyData));
                setDailyDate(foundDateStr);

                // --- Weekly: aggregate papers from the past 7 days ---
                const seenIds = new Set<string>();
                const allWeeklyRaw: any[] = [];

                // We already fetched some dates above; start from day 0 again for completeness
                // but reuse dailyData for the foundDateStr to avoid re-fetching
                for (let i = 0; i < 7; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const dateStr = getLocalDateStr(d);

                    let data: any[];
                    if (dateStr === foundDateStr) {
                        data = dailyData;
                    } else {
                        try {
                            data = await fetchByDate(dateStr);
                        } catch {
                            data = [];
                        }
                    }

                    for (const item of (data || [])) {
                        const id = item.paper?.id;
                        if (id && !seenIds.has(id)) {
                            seenIds.add(id);
                            allWeeklyRaw.push(item);
                        }
                    }
                }

                // Sort by upvotes descending
                allWeeklyRaw.sort((a, b) => (b.paper?.upvotes || 0) - (a.paper?.upvotes || 0));

                setWeeklyPapers(formatPapers(allWeeklyRaw));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Sensor failure reading HF flux');
                console.error("HF Lab Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    return { dailyPapers, weeklyPapers, dailyDate, loading, error };
}
