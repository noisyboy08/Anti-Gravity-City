/**
 * CommitTimeline.jsx
 * "Ghost of Commits" — a themed slider that filters 3D islands
 * based on commit date, making the city visually "grow" over time.
 */

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, GitCommit, CalendarDays } from 'lucide-react';

export function CommitTimeline({ value, onChange, repoInfo, themeColor = '#00f5ff', commitLog = [] }) {
    const sliderRef = useRef(null);
    const totalCommits = repoInfo?.commits_count || 100;
    const createdAt = repoInfo?.created_at ? new Date(repoInfo.created_at) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);
    const now = new Date();
    const ageMs = now - createdAt;

    // Convert slider value (0-100) to a date
    const getDateAtProgress = (pct) => {
        return new Date(createdAt.getTime() + (ageMs * pct / 100));
    };

    const currentDate = getDateAtProgress(value);
    const estimatedCommitsVisible = Math.round((value / 100) * totalCommits);

    const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <motion.div
            className="commit-timeline"
            style={{ '--theme-color': themeColor }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Header */}
            <div className="timeline-header">
                <div className="timeline-title">
                    <Clock size={13} />
                    <span>GHOST OF COMMITS</span>
                </div>
                <div className="timeline-date" style={{ color: themeColor }}>
                    {formatDate(currentDate)}
                </div>
            </div>

            {/* Slider Track */}
            <div className="timeline-track-wrap">
                <div className="timeline-track-bg">
                    <div
                        className="timeline-track-fill"
                        style={{
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${themeColor}44, ${themeColor})`,
                        }}
                    />
                    {/* Commit markers — evenly distributed ghost dots */}
                    {Array.from({ length: Math.min(totalCommits, 40) }).map((_, i) => {
                        const pct = (i / Math.min(totalCommits, 40)) * 100;
                        const visible = pct <= value;
                        return (
                            <div
                                key={i}
                                className={`commit-marker ${visible ? 'visible' : ''}`}
                                style={{
                                    left: `${pct}%`,
                                    background: visible ? themeColor : 'rgba(255,255,255,0.15)',
                                    boxShadow: visible ? `0 0 6px ${themeColor}` : 'none',
                                }}
                            />
                        );
                    })}
                </div>

                <input
                    ref={sliderRef}
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="timeline-slider"
                    style={{ '--thumb-color': themeColor }}
                />
            </div>

            {/* Stats row */}
            <div className="timeline-stats">
                <div className="timeline-stat">
                    <span className="tl-stat-icon"><CalendarDays size={11} /></span>
                    <span className="tl-stat-label">
                        {formatDate(createdAt)} → {formatDate(now)}
                    </span>
                </div>
                <div className="timeline-stat" style={{ color: themeColor }}>
                    <span className="tl-stat-icon"><GitCommit size={11} /></span>
                    <span className="tl-stat-label">
                        {estimatedCommitsVisible} / {totalCommits} commits
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
