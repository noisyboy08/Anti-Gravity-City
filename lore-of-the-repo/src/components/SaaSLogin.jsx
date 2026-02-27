import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SaaSLogin({ onLogin }) {
    const [loading, setLoading] = useState(false);

    const handleOAuth = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin(true);
        }, 1500); // Simulate API call
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            background: 'radial-gradient(circle at center, #0B0E14 0%, #000 100%)',
            color: '#fff', fontFamily: 'Orbitron, sans-serif'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', border: '1px solid rgba(0, 245, 255, 0.3)', padding: '50px 60px', borderRadius: '16px', background: 'rgba(0, 245, 255, 0.05)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0, 245, 255, 0.1)' }}
            >
                <h1 style={{ marginBottom: '10px', fontSize: '32px', letterSpacing: '2px', color: '#00f5ff' }}>LORD OF REPO</h1>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#888', marginBottom: '40px' }}>ENTERPRISE SAAS VISUALIZATION PLATFORM</p>
                
                <button 
                    onClick={handleOAuth}
                    disabled={loading}
                    style={{
                        padding: '14px 28px', fontSize: '16px', borderRadius: '8px', border: '1px solid #00f5ff',
                        background: 'rgba(0, 245, 255, 0.1)', color: '#00f5ff', cursor: loading ? 'wait' : 'pointer',
                        fontFamily: 'Space Mono', display: 'flex', alignItems: 'center', gap: '15px', margin: '0 auto',
                        boxShadow: '0 4px 20px rgba(0,245,255,0.2)', transition: 'background 0.3s'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#00f5ff"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    {loading ? 'AUTHENTICATING...' : 'LOGIN WITH GITHUB'}
                </button>
            </motion.div>
        </div>
    );
}
