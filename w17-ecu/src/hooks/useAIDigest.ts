import { useState } from 'react';
import { Repo } from './useGitHubTrending';
import { HFPaper } from './useHuggingFacePapers';
import { CopilotConfig } from './useCopilotConfig';

export interface DigestItem {
    id: string; // url or guid
    title: string; // translated
    sourceTitle: string;
    link: string;
    summary: string[]; // 3 bullet points
    score: number;
    type: 'github' | 'hf';
}

export function useAIDigest() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [digest, setDigest] = useState<DigestItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateDigest = async (config: CopilotConfig, repos: Repo[], papers: HFPaper[], hours: number, topN: number) => {
        setIsGenerating(true);
        setError(null);

        try {
            if (!config.apiKey) {
                throw new Error("API Key missing. Please configure Copilot.");
            }

            // 1. Filter data by timeframe
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - hours);
            const cutoffISO = cutoffDate.toISOString();

            // Note: GitHub search API data is already filtered by creation date in the hook (last 7 days by default).
            // HF Papers pubDate can be filtered.
            const validPapers = papers.filter(p => new Date(p.pubDate) >= cutoffDate);
            // Treat repos as valid within the timeframe since we only pull weekly trending anyway, or we could strict filter if GH API provided exact created_at in the frontend model. We'll pass all to LLM to let it judge.

            // 2. Prepare payload for LLM
            const payloadData = {
                github_trending: repos.map(r => ({ name: r.name, description: r.description, stars: r.stars, url: r.url })),
                hf_papers: validPapers.map(p => ({ title: p.title, summary: p.contentSnippet, date: p.pubDate, url: p.link }))
            };

            const systemPrompt = `You are an elite AI race engineer providing a tactical daily briefing (Tactical Briefing).
Analyze the provided JSON containing GitHub Trending repositories and Hugging Face Papers.
Filter and select EXACTLY the top ${topN} most impactful items across both categories based on technical disruption, utility, and relevance to AI engineering.

For each selected item, return a JSON object with the following schema:
{
  "digests": [
    {
       "id": "Original URL",
       "title": "Translated Chinese Title (Make it sound professional and tactical)",
       "sourceTitle": "Original English Name/Title",
       "link": "Original URL",
       "summary": ["Bullet point 1 in Chinese", "Bullet point 2 in Chinese", "Bullet point 3 in Chinese"],
       "score": 95, // 0-100 impact score
       "type": "github" // or "hf"
    }
  ]
}

Return ONLY valid JSON. No markdown formatting, no explanations.`;

            // Gemini API currently has issues with strictly enforced json_object format in standard completion calls
            // We will conditionally omit response_format if using gemini
            const isGemini = config.baseUrl.includes('generative');

            // Gemini API expects the model name to properly formatted
            let formattedModel = config.model;

            if (isGemini) {
                // If user accidentally inputs something like 'gpt-4o-mini' into a gemini URL, or inputs a raw model name, 
                // Gemini API might complain. 
                // "GenerateContentRequest.model: unexpected model name format" 
                // It usually wants gemini-xxxx or models/gemini-xxxx
                const lowerModel = formattedModel.toLowerCase();
                if (!lowerModel.startsWith('models/') && !lowerModel.startsWith('gemini-')) {
                    formattedModel = `models/${formattedModel}`;
                }
            }

            const payload = {
                model: formattedModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify(payloadData) }
                ],
                temperature: 0.3,
                ...(isGemini ? {} : { response_format: { type: "json_object" } })
            };

            const response = await fetch(`${config.baseUrl}/chat/completions`.replace('/chat/completions/chat/completions', '/chat/completions'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errMsg = `LLM API Error: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errMsg = errorData.error?.message || errorData.message || JSON.stringify(errorData) || errMsg;
                } catch (e) {
                    errMsg = `${errMsg} - ${errorText}`;
                }
                throw new Error(errMsg);
            }

            const data = await response.json();
            let content = data.choices[0].message.content;

            try {
                // Gemini sometimes returns markdown code blocks despite explicit instructions not to
                if (content.startsWith('```json')) {
                    content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                } else if (content.startsWith('```')) {
                    content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
                }

                const parsed = JSON.parse(content);
                if (parsed.digests && Array.isArray(parsed.digests)) {
                    // Sort by score descending and take Top N just in case the LLM returns more
                    const finalDigest = parsed.digests.sort((a: DigestItem, b: DigestItem) => b.score - a.score).slice(0, topN);
                    setDigest(finalDigest);
                } else {
                    throw new Error("Invalid output format from LLM.");
                }
            } catch (parseError) {
                throw new Error("Failed to parse LLM JSON output.");
            }

        } catch (err: any) {
            setError(err.message);
            console.error("Digest Generation Error:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateDigest, isGenerating, digest, setDigest, error };
}
