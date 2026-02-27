import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export function RepoChatModal({ onClose, geminiApiKey, repoInfo }) {
    const [messages, setMessages] = useState([
        { role: 'model', text: `Initializing GitNexus Code Intelligence... \nAccessing Knowledge Graph for ${repoInfo?.name || 'this repo'}...\nI have indexed the architecture. Ask me anything.` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !geminiApiKey) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const systemPrompt = `You are GitNexus AI inside Lord of Repo. You have full architectural awareness of the repository: ${JSON.stringify(repoInfo)}. The user is asking you questions about this codebase. Answer technically, concisely, and act like a senior engineer who has just analyzed the AST and Dependency Graph.`;

            // Gemini strictly requires the first message to be 'user'
            // We skip the first initialized message (index 0) which is 'model'
            const history = messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            // Filter out any consecutive roles to prevent API crashes if the user gets duplicates/errors
            const validContents = [];
            let lastRole = null;
            for (const msg of [...history, { role: 'user', parts: [{ text: userMsg.text }] }]) {
                if (msg.role !== lastRole) {
                    validContents.push(msg);
                    lastRole = msg.role;
                } else if (validContents.length > 0) {
                    validContents[validContents.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
                }
            }

            // Ensure first is always user
            if (validContents.length > 0 && validContents[0].role === 'model') {
                validContents.shift();
            }

            const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: validContents,
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Gemini API Error:', data);
                throw new Error(data?.error?.message || 'API Error');
            }

            const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

            setMessages(prev => [...prev, { role: 'model', text: replyText }]);
        } catch (err) {
            console.error('Chat Error:', err);
            setMessages(prev => [...prev, { role: 'model', text: "Error: " + err.message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            style={{ position: 'fixed', top: '76px', bottom: '0', right: '0', width: '380px', background: '#0a0d14', borderLeft: '1px solid rgba(139, 92, 246, 0.2)', zIndex: 600, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)' }}>

            {/* Header */}
            <div style={{ padding: '15px 20px', background: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#e5e7eb', fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', color: '#a78bfa' }}>✧</span> Nexus AI
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!geminiApiKey && (
                    <div style={{ color: '#ff4444', fontSize: '12px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
                        ⚠️ Missing Gemini API Key. Please add it to the search bar screen first to enable codebase chat.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? 'rgba(139, 92, 246, 0.15)' : '#111827', border: m.role === 'user' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid #1f2937', padding: '12px', borderRadius: '8px', maxWidth: '85%', color: '#e6edf3', fontSize: '12px', lineHeight: '1.5', fontFamily: m.role === 'model' ? 'Space Mono, monospace' : 'sans-serif', whiteSpace: 'pre-wrap' }}>
                        {m.text}
                    </div>
                ))}
                {loading && <div style={{ alignSelf: 'flex-start', color: '#a78bfa', fontSize: '11px', fontFamily: 'Space Mono, monospace', padding: '10px' }}>Analyzing architectural matrices...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '15px', background: '#0a0d14', borderTop: '1px solid #1f2937' }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about the codebase..." disabled={!geminiApiKey || loading} style={{ flex: 1, background: '#111827', border: '1px solid #374151', color: '#fff', padding: '12px', borderRadius: '6px', outline: 'none', fontSize: '12px', fontFamily: 'Space Mono, monospace' }} />
                <button type="submit" disabled={!geminiApiKey || loading || !input.trim()} style={{ marginLeft: '10px', background: !input.trim() ? '#374151' : '#a78bfa', color: '#000', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: 'bold', cursor: !input.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s', fontFamily: 'Orbitron' }}>Send</button>
            </form>
        </motion.div>
    );
}
