import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { toast, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Programming', 'English'];

export default function Chatbot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [subject, setSubject] = useState('General');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [listening, setListening] = useState(false);
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        api.get('/chat').then(r => setMessages(r.data.messages || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const sendMessage = async (text = input) => {
        if (!text.trim() || sending) return;
        const content = text.trim();
        setInput('');
        // Optimistic UI
        const tempMsg = { _id: Date.now(), role: 'user', content, subject, createdAt: new Date() };
        setMessages(prev => [...prev, tempMsg]);
        setSending(true);
        setTyping(true);
        try {
            const res = await api.post('/chat', { content, subject });
            setMessages(prev => [...prev, res.data.message]);
        } catch { toast.error('Failed to send message'); }
        finally { setSending(false); setTyping(false); }
    };

    const startVoice = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast.error('Voice input not supported in this browser'); return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (e) => setInput(e.results[0][0].transcript);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => { setListening(false); toast.error('Voice recognition error'); };
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    const clearChat = async () => {
        try {
            await api.delete('/chat/clear');
            setMessages([]);
            toast.success('Chat cleared!');
        } catch { toast.error('Failed to clear chat'); }
    };

    if (loading) return <Spinner />;

    return (
        <div className="page-container" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', padding: '16px 24px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>🤖 AI Study Assistant</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>Get instant help with your doubts</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', width: 'auto' }}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={clearChat} className="btn btn-secondary btn-sm">🗑️ Clear</button>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0', background: 'transparent', border: 'none' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
                        <p style={{ marginBottom: 8 }}>Hi {user?.name}! I'm your AI Study Assistant.</p>
                        <p style={{ fontSize: '0.85rem' }}>Ask me anything about {subject}!</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                        <div className={`chat-bubble ${msg.role}`}>
                            {msg.content}
                        </div>
                        {msg.role === 'assistant' && (
                            <button onClick={() => speak(msg.content)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', paddingLeft: 8 }}>
                                🔊 Listen
                            </button>
                        )}
                    </div>
                ))}
                {typing && (
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="chat-bubble assistant" style={{ padding: '12px 16px' }}>
                            <span>●●●</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={startVoice} className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }} title="Voice input">
                    {listening ? '🔴' : '🎤'}
                </button>
                <input
                    type="text"
                    className="input-field"
                    placeholder={`Ask about ${subject}...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1 }}
                />
                <button onClick={() => sendMessage()} className="btn btn-primary" disabled={!input.trim() || sending} style={{ flexShrink: 0, padding: '0 20px' }}>
                    {sending ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
}
