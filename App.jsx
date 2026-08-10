import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import './App.css';

// Secure initialization using Vercel Environment Variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // 💰 MONETIZATION CONFIG: Replace this with your actual UPI ID string (e.g., yourname@oksbi)
  const yourUPI = "yourupiid@upi"; 
  const upiLink = `upi://pay?pa=${yourUPI}&pn=AIEducator&am=20&cu=INR&tn=Support%20AI%20Educator`;

  const handleAskAI = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
      });
      setResponse(response.text);
    } catch (error) {
      setResponse("Oops! Something went wrong. Please check your setup.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      {/* 1. RESPONSIVE TOP AD BANNER */}
      <div className="ad-banner top-ad">
        <p className="ad-placeholder">✨ Sponsored Content (Fits Laptop & Mobile Screens) ✨</p>
        {/* Paste your network script here later (e.g., Infolinks / PropellerAds) */}
      </div>

      <header className="app-header">
        <h1>AI Educator 🎓</h1>
        <p>Your Free Smart AI Study Companion</p>
      </header>

      <main className="main-content">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any homework question or paste code here..."
          rows={4}
        />
        <button onClick={handleAskAI} disabled={loading}>
          {loading ? 'Thinking...' : 'Get Instant Answer'}
        </button>

        {response && (
          <div className="response-box">
            <h3>Explanation:</h3>
            <p>{response}</p>
          </div>
        )}
      </main>

      {/* 2. MULTI-DEVICE MICRO-DONATION BUTTON */}
      <div className="monetization-section">
        <h3>Found this helpful? Help keep it free!</h3>
        <p>No subscriptions. A small ₹20 tip helps pay for server costs.</p>
        
        <div className="payment-buttons">
          {/* Universal Mobile deep link (Opens PhonePe/GPay instantly on phone) */}
          <a href={upiLink} className="payment-btn upi-btn">
            📱 Support via UPI (Mobile)
          </a>
          
          {/* Web fallback link */}
          <a href="https://buymeacoffee.com" target="_blank" rel="noreferrer" className="payment-btn bmac-btn">
            ☕ Buy Me a Coffee (Laptop)
          </a>
        </div>
      </div>

      {/* 3. RESPONSIVE BOTTOM AD BANNER */}
      <div className="ad-banner bottom-ad">
        <p className="ad-placeholder">✨ Sponsored Link Placeholder ✨</p>
      </div>
    </div>
  );
}

export default App;
