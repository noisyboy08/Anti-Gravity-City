/**
 * geminiNarrative.js
 * Gemini API integration for AI-powered city narrative generation.
 * Falls back to deterministic narrative if no API key is provided.
 */

import { generateNarrative } from './narrativeEngine';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a legendary narrator for "Lord of Repo" — a 3D anti-gravity city visualizer.
Your job is to analyze a GitHub repository and generate an epic, cinematic city lore.

Return ONLY valid JSON with this exact schema:
{
  "theme": "cyber-astral" | "bioluminescent" | "steampunk" | "minimalist-void",
  "themeName": "Human readable theme name",
  "lore": "2-3 sentence legendary backstory. Make it sound like a high-fantasy/sci-fi narrator. Mention the repo name, language, and contributor count.",
  "core": "1 sentence describing the central energy source/hub (e.g., 'a rotating \${language} crystal powered by 500 commits')",
  "coreEmoji": "1 emoji representing the core",
  "colors": {
    "primaryColor": "#hex — main glowing accent color",
    "secondaryColor": "#hex — secondary accent",
    "accentColor": "#hex — highlight color",
    "ambientColor": "#hex — dark background tint",
    "beamColor": "#hex — energy beam connection color"
  },
  "cityPersonality": "1 sentence describing the 'vibe' of this city (aggressive, serene, ancient, futuristic, etc.)"
}

Constraints:
- Choose theme based on language: Python/ML → bioluminescent, Rust/C/C++ → steampunk, JS/TS/React → cyber-astral, minimalist/Go → minimalist-void
- Make lore LEGENDARY and EPIC. Use dramatic language.
- Colors must create a cohesive deep-space palette. Dark backgrounds, bright accents.`;

/**
 * Call Gemini API to generate narrative
 */
async function callGemini(apiKey, repoData) {
    const { name, language, description, stargazers_count, contributors_count, commits_count } = repoData;

    const userPrompt = `Analyze this GitHub repository and generate city lore:
Repository: ${name}
Language: ${language || 'Unknown'}
Description: ${description || 'No description'}
Stars: ${stargazers_count || 0}
Contributors: ${contributors_count || 1}
Estimated Commits: ${commits_count || 100}
README Snippet: "${description || 'A software project'}..."

Generate the JSON narrative now.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: SYSTEM_PROMPT },
                        { text: userPrompt },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.85,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');

    // Parse the JSON from the response
    const parsed = JSON.parse(text);
    return parsed;
}

/**
 * Main narrative generation — tries Gemini first, falls back to deterministic engine
 */
export async function generateAINarrative(repoData, apiKey = null) {
    // Try Gemini if API key exists
    if (apiKey && apiKey.trim().startsWith('AIza')) {
        try {
            const geminiResult = await callGemini(apiKey, repoData);
            // Merge with stats from deterministic engine
            const deterministic = generateNarrative(repoData);
            return {
                ...deterministic,
                ...geminiResult,
                stats: deterministic.stats, // Always use real stats
                isAIGenerated: true,
            };
        } catch (err) {
            console.warn('Gemini narrative failed, falling back to deterministic:', err.message);
        }
    }

    // Fallback: deterministic engine
    return {
        ...generateNarrative(repoData),
        isAIGenerated: false,
    };
}
