import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import './App.css';

// Secure initialization using Vercel Environment Variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am RoohithAI. Ask me any homework or coding questions!' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scrolls the chat area down when a new answer arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskAI = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Oops! Something went wrong. Please check your setup.' }]);
    }
    setLoading(false);
  };

  // Handles Laptop users pressing Enter (but allows Shift+Enter for new lines)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>RoohithAI 🎓</h1>
      </header>

      {/* 🤖 THE CORE 75% CHAT AREA */}
      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role}-bubble`}>
            <strong>{msg.role === 'user' ? 'You' : 'RoohithAI'}:</strong>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {loading && <div className="message-bubble ai-bubble thinking">Thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* ⌨️ ORIGINAL BOTTOM INPUT FORM ACCORDING TO YOUR FIRST STYLE */}
      <footer className="input-footer">
        <div className="input-block">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Press Enter to send)"
            disabled={loading}
            rows={2}
          />
          <button onClick={handleAskAI} disabled={loading} className="send-btn">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
