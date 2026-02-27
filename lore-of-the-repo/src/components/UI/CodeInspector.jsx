import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { LiveCodeExecution } from '../LiveCodeExecution';
import { Bot, GitCommit, GitPullRequest, Code2, Copy, X, Sparkles } from 'lucide-react';

export function CodeInspector() {
    const [openFiles, setOpenFiles] = useState([]);
    
    // Per-file states
    const [askingCopilot, setAskingCopilot] = useState({});
    const [pushing, setPushing] = useState({});

    useEffect(() => {
        const handleOpenFile = (e) => {
            const { name, path, content, type } = e.detail;
            setOpenFiles(prev => {
                if (prev.find(f => f.path === path)) return prev;
                return [{ name, path, content: content || '// Content currently un-fetched...', type, id: Date.now() }, ...prev];
            });
        };

        window.addEventListener('OPEN_CODE_FILE', handleOpenFile);
        return () => window.removeEventListener('OPEN_CODE_FILE', handleOpenFile);
    }, []);

    const closeFile = (id) => {
        setOpenFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileContent = (id, newContent) => {
        setOpenFiles(prev => prev.map(f => f.id === id ? { ...f, content: newContent } : f));
    }

    const handleCopilot = (id) => {
        setAskingCopilot(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setOpenFiles(prev => prev.map(f => {
                if(f.id === id) {
                    const aiComments = `\n// [Copilot AI]: Optimized structure for ${f.name}\n// Consider implementing memoization here to prevent re-renders.\n`;
                    return { ...f, content: aiComments + f.content };
                }
                return f;
            }));
            setAskingCopilot(prev => ({ ...prev, [id]: false }));
        }, 1500);
    };

    const handleGitPush = (id) => {
        setPushing(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setPushing(prev => ({ ...prev, [id]: false }));
            alert('🚀 Successfully pushed changes to GitHub branch: feature/ai-updates');
        }, 2000);
    };

    if (openFiles.length === 0) return null;

    return (
        <div style={{
            position: 'absolute', left: '260px', top: '86px', bottom: '10px', width: '500px',
            zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px',
            overflowY: 'auto', paddingRight: '8px'
        }}>
            <AnimatePresence>
                {openFiles.map(file => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            background: '#0a0d14', border: '1px solid #1a2333',
                            borderRadius: '8px', overflow: 'hidden', display: 'flex',
                            flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            flexShrink: 0
                        }}
                    >
                        {/* Header Bar */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', background: '#111827', borderBottom: '1px solid #1f2937'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Code2 size={14} color="#3b82f6" />
                                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', color: '#e5e7eb', letterSpacing: '0.5px' }}>
                                    {file.name}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleCopilot(file.id)}
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.5)',
                                        color: '#a78bfa', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px',
                                        fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
                                        fontFamily: 'Orbitron'
                                    }}
                                >
                                    {askingCopilot[file.id] ? <Sparkles size={12} className="spinning" /> : <Bot size={12} />}
                                    {askingCopilot[file.id] ? 'AI THINKING...' : 'COPILOT'}
                                </button>
                                
                                <button
                                    onClick={() => handleGitPush(file.id)}
                                    style={{
                                        background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
                                        color: '#10b981', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px',
                                        fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
                                        fontFamily: 'Orbitron'
                                    }}
                                >
                                    {pushing[file.id] ? <GitPullRequest size={12} className="spinning" /> : <GitCommit size={12} />}
                                    {pushing[file.id] ? 'PUSHING...' : 'COMMIT & PUSH'}
                                </button>

                                <button onClick={() => closeFile(file.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* File Path */}
                        <div style={{
                            padding: '6px 12px', background: '#0a0d14', fontSize: '10px',
                            color: '#6b7280', fontFamily: 'Space Mono, monospace'
                        }}>
                            {file.path}
                        </div>

                        {/* Monaco Editor */}
                        <div style={{ height: '280px', width: '100%', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937' }}>
                            <Editor
                                height="100%"
                                language="javascript"
                                theme="vs-dark"
                                value={file.content}
                                onChange={(val) => updateFileContent(file.id, val)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 11,
                                    fontFamily: "'Space Mono', monospace",
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: "smooth",
                                    padding: { top: 12, bottom: 12 }
                                }}
                            />
                        </div>

                        {/* Live Execution Panel */}
                        <div style={{ padding: '0 12px 12px 12px', background: '#0a0d14' }}>
                            <LiveCodeExecution fileContent={file.content} fileName={file.name} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
