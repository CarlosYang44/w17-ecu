import { useState, useEffect } from 'react';

export interface Repo {
    author: string;
    name: string;
    avatar: string;
    url: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
    forks: number;
    currentPeriodStars: number;
}

export function useGitHubTrending() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            try {
                // Build a date string for 7 days ago to get "weekly trending"
                const date = new Date();
                date.setDate(date.getDate() - 7);
                const queryDate = date.toISOString().split('T')[0];

                // Use GitHub's official search API to find repos created recently, sorted by stars
                const response = await fetch(`https://api.github.com/search/repositories?q=created:>${queryDate}&sort=stars&order=desc`, {
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`Data acquisition failed with status: ${response.status}`);
                }

                const data = await response.json();

                const formattedRepos = data.items.map((item: any) => ({
                    author: item.owner.login,
                    name: item.name,
                    avatar: item.owner.avatar_url,
                    url: item.html_url,
                    description: item.description || 'No description provided.',
                    language: item.language || 'Unknown',
                    languageColor: item.language ? '#E6E6E6' : '#333', // Default color, as GH API doesn't return colors
                    stars: item.stargazers_count,
                    forks: item.forks_count,
                    currentPeriodStars: item.stargazers_count, // Since they are new, all stars are recent
                }));

                setRepos(formattedRepos);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown telemetry failure');
                console.error("GitHub Telemetry Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    return { repos, loading, error };
}
