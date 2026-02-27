import { useRef, useEffect } from 'react';
import { QA } from '../chemicals';

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export default function AssistantPanel({ messages, setMessages }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    function handleSubmit(e) {
        e.preventDefault();
        const input = e.target.elements.chatInput;
        const text = input.value.trim();
        if (!text) return;

        const userMsg = { role: 'user', html: escapeHtml(text) };
        const lower = text.toLowerCase();
        const match = QA.find(q => q.keywords.some(k => lower.includes(k)));

        const botReply = match
            ? match.reply
            : `🤔 Interesting question! Try mixing chemicals or ask about <strong>acids</strong>, <strong>reactivity series</strong>, or <strong>safety</strong>.`;

        setMessages(prev => [...prev, userMsg, { role: 'bot', html: botReply }]);
        input.value = '';
    }

    return (
        <aside className="chat-panel glass-card">
            <div className="chat-header">
                <span className="chat-avatar">🤖</span>
                <div>
                    <h3>Lab Assistant</h3>
                    <span className="status-dot online" /><span className="status-text">Online</span>
                </div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
                        <p dangerouslySetInnerHTML={{ __html: m.html }} />
                    </div>
                ))}
            </div>

            <form className="chat-input-bar" onSubmit={handleSubmit}>
                <input type="text" name="chatInput" placeholder="Ask me anything about chemistry…" autoComplete="off" />
                <button type="submit" className="send-btn">➤</button>
            </form>
        </aside>
    );
}
