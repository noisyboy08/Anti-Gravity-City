/**
 * useGitHubData.js — v3 (fixed)
 * Robust GitHub repo fetcher with:
 * - Bulletproof URL parser (handles all GitHub URL forms)
 * - Uses repo's actual default_branch (main/master/etc.) for tree fetch
 * - Retries tree fetch with branch name if first attempt fails
 * - Graceful partial failures (city still builds even if tree fails)
 * - Detailed, actionable error messages
 */

import { useState, useCallback } from 'react';
import { buildCityLayout, buildDemoCity } from '../utils/cityBuilder';
import { generateAINarrative } from '../utils/geminiNarrative';

const GITHUB_API = 'https://api.github.com';

// ─── URL Parser ───────────────────────────────────────────────
// Handles ALL of these forms:
//   https://github.com/facebook/react
//   https://github.com/facebook/react/tree/main/packages/react
//   github.com/facebook/react#readme
//   facebook/react
//   https://github.com/facebook/react.git
function parseRepoUrl(rawUrl) {
    let url = (rawUrl || '').trim();

    // Remove hash fragment and query string
    url = url.split('#')[0].split('?')[0];

    // Remove trailing slash
    url = url.replace(/\/$/, '');

    // Remove .git suffix
    url = url.replace(/\.git$/, '');

    // Remove protocol
    url = url.replace(/^https?:\/\//, '');

    // Remove leading www.
    url = url.replace(/^www\./, '');

    // Remove github.com/ prefix
    url = url.replace(/^github\.com\//, '');

    // Now url should be "owner/repo" or "owner/repo/tree/branch/path..."
    const parts = url.split('/').filter(Boolean);

    if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
    }

    return null;
}

// ─── GitHub API Fetcher ───────────────────────────────────────
async function ghFetch(url, label = '') {
    let resp;
    try {
        resp = await fetch(url, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });
    } catch (networkErr) {
        throw new Error(`Network error: cannot reach GitHub API. Check your internet connection.`);
    }

    if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        const rateLimitReset = resp.headers.get('X-RateLimit-Reset');
        const resetTime = rateLimitReset
            ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
            : null;

        if (resp.status === 401) throw new Error('GitHub authentication failed. Remove the token and try again.');
        if (resp.status === 403) {
            if (body.includes('rate limit')) {
                throw new Error(`GitHub API rate limit exceeded.${resetTime ? ` Resets at ${resetTime}.` : ' Please wait ~1 minute and retry.'}`);
            }
            throw new Error('GitHub API access forbidden. The repository may be private.');
        }
        if (resp.status === 404) {
            throw new Error(
                `Repository not found (404)${label ? ` [${label}]` : ''}.\n\nCheck that:\n• The URL is spelled correctly\n• The repository is public\n• Example: github.com/facebook/react`
            );
        }
        if (resp.status === 451) throw new Error('Repository unavailable due to legal reasons (451).');
        throw new Error(`GitHub API error ${resp.status}${label ? ` [${label}]` : ''}. Please try again.`);
    }

    return resp.json();
}

// ─── Tree Fetcher (resilient) ─────────────────────────────────
async function fetchRepoTree(owner, repo, defaultBranch) {
    // Try 1: default branch by name (most reliable)
    try {
        const data = await ghFetch(
            `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
            'tree'
        );
        if (data?.tree) return data.tree;
    } catch (e) {
        console.warn('Tree fetch by branch failed:', e.message);
    }

    // Try 2: HEAD ref (some repos respond to this)
    try {
        const data = await ghFetch(
            `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
            'HEAD-tree'
        );
        if (data?.tree) return data.tree;
    } catch (e) {
        console.warn('Tree fetch via HEAD failed:', e.message);
    }

    // Try 3: contents API as last resort (flatter, no sub-dirs)
    try {
        const contents = await ghFetch(
            `${GITHUB_API}/repos/${owner}/${repo}/contents`,
            'contents'
        );
        if (Array.isArray(contents)) {
            return contents.map(item => ({
                path: item.path,
                type: item.type === 'dir' ? 'tree' : 'blob',
                sha: item.sha,
                size: item.size || 0,
            }));
        }
    } catch (e) {
        console.warn('Contents API fallback failed:', e.message);
    }

    // Give up — city will still build from repo metadata alone
    console.warn('All tree fetch methods failed — building city from metadata only');
    return [];
}

// ─── Contributor Count ────────────────────────────────────────
async function getContributorCount(owner, repo) {
    try {
        const resp = await fetch(
            `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
            { headers: { Accept: 'application/vnd.github.v3+json' } }
        );
        const link = resp.headers.get('Link') || '';
        const match = link.match(/page=(\d+)>; rel="last"/);
        if (match) return parseInt(match[1]);
        const data = await resp.json();
        return Array.isArray(data) ? Math.max(1, data.length) : 1;
    } catch {
        return 1;
    }
}

// ─── Commit Estimate ──────────────────────────────────────────
function estimateCommits(repoData) {
    const createdAt = new Date(repoData.created_at || Date.now());
    const monthsOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(10, Math.floor(monthsOld * 18 + (repoData.stargazers_count || 0) * 0.25));
}

// ─── Hook ─────────────────────────────────────────────────────
export function useGitHubData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cityData, setCityData] = useState(null);
    const [narrative, setNarrative] = useState(null);
    const [repoInfo, setRepoInfo] = useState(null);
    const [geminiApiKey, setGeminiApiKey] = useState(
        () => {
            try { return localStorage.getItem('lotr_gemini_key') || ''; }
            catch { return ''; }
        }
    );

    const saveApiKey = useCallback((key) => {
        setGeminiApiKey(key);
        try {
            if (key) localStorage.setItem('lotr_gemini_key', key);
            else localStorage.removeItem('lotr_gemini_key');
        } catch { }
    }, []);

    const fetchRepo = useCallback(async (repoUrl) => {
        setLoading(true);
        setError(null);
        setCityData(null);
        setNarrative(null);
        setRepoInfo(null);

        try {
            const parsed = parseRepoUrl(repoUrl);
            if (!parsed) {
                throw new Error(
                    'Invalid GitHub URL format.\n\nValid examples:\n• github.com/facebook/react\n• https://github.com/vercel/next.js\n• torvalds/linux'
                );
            }

            const { owner, repo } = parsed;
            console.log(`[Lore] Fetching repo: ${owner}/${repo}`);

            // Step 1: Fetch repo metadata (fail fast if this fails)
            const repoData = await ghFetch(`${GITHUB_API}/repos/${owner}/${repo}`, `${owner}/${repo}`);
            console.log(`[Lore] Repo found: ${repoData.full_name}, default branch: ${repoData.default_branch}`);

            // Step 2: Fetch tree + contributors in parallel (both are best-effort)
            const [tree, contributors_count] = await Promise.all([
                fetchRepoTree(owner, repo, repoData.default_branch || 'main'),
                getContributorCount(owner, repo),
            ]);

            console.log(`[Lore] Tree: ${tree.length} nodes, Contributors: ${contributors_count}`);

            const enrichedMeta = {
                ...repoData,
                contributors_count,
                commits_count: estimateCommits(repoData),
            };

            // Step 3: Generate narrative + build city
            const [generatedNarrative, layout] = await Promise.all([
                generateAINarrative(enrichedMeta, geminiApiKey || null),
                Promise.resolve(buildCityLayout(tree, enrichedMeta)),
            ]);

            window.CURRENT_REPO_INFO = enrichedMeta;
            setRepoInfo(enrichedMeta);
            setNarrative(generatedNarrative);
            setCityData(layout);

        } catch (err) {
            console.error('[Lore] Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [geminiApiKey]);

    const loadDemo = useCallback(async () => {
        setLoading(true);
        setError(null);

        const demoMeta = {
            name: 'lord-of-repo',
            full_name: 'demo/lord-of-repo',
            language: 'JavaScript',
            description: 'Transform any GitHub repository into an epic 3D anti-gravity floating city',
            stargazers_count: 2847,
            forks_count: 312,
            open_issues_count: 14,
            contributors_count: 23,
            commits_count: 847,
            topics: ['threejs', 'visualization', 'github', 'react', 'ai'],
            size: 14200,
            default_branch: 'main',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
        };

        try {
            const [generatedNarrative] = await Promise.all([
                generateAINarrative(demoMeta, geminiApiKey || null),
            ]);
            const layout = buildDemoCity(demoMeta);

            setRepoInfo(demoMeta);
            setNarrative(generatedNarrative);
            setCityData(layout);
        } catch (err) {
            console.error('[Demo] Load error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [geminiApiKey]);

    return {
        loading, error, cityData, narrative, repoInfo,
        fetchRepo, loadDemo,
        geminiApiKey, saveApiKey,
    };
}
