import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// Clean initialization using Vercel Environment Variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function App() {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am RoohithAI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Smooth scroll handler to lock view on incoming messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Try Google Chrome!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: "Your name is RoohithAI. You are a highly advanced AI assistant created by Roohith and powered by Google models. When giving programming or scripting code answers, always wrap the code blocks using triple backticks like: ```javascript\\ncode here\\n``` so they format nicely."
        }
      });

      const replyText = response.text || "I couldn't process that response.";
      setMessages((prev) => [...prev, { role: 'model', text: replyText }]);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setMessages((prev) => [
        ...prev, 
        { role: 'model', text: 'Error connecting to RoohithAI servers. Please check your network connection.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Upgraded parser to split text into rich blocks, bold strings (**text**), and clean code containers
  const renderMessageText = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      // Handle Code Blocks
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : 'code';
        const codeText = match ? match[2].trim() : part.slice(3, -3).trim();

        return (
          <div key={index} style={styles.codeContainer}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLang}>{language}</span>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  alert("Code copied to clipboard!");
                }} 
                style={styles.copyButton}
              >
                Copy Code
              </button>
            </div>
            <pre style={styles.codePre}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      
      // Handle Inline Bold Strings (**bold**)
      const boldParts = part.split(/(\*\*[\s\S]*?\*\*)/g);
      return (
        <span key={index}>
          {boldParts.map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} style={{ fontWeight: '700', color: '#ffffff' }}>{subPart.slice(2, -2)}</strong>;
            }
            return <span key={subIndex}>{subPart}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div style={styles.container}>
      {/* Brand Navigation Sidebar Workspace */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img 
            src="/shadow.jpg" 
            alt="Shadow Logo" 
            style={styles.logoImage} 
            onError={(e) => { e.target.src = '/shadow.jpg.jpg'; }}
          />
          <h1 style={styles.brandName}>RoohithAI</h1>
        </div>
        <button style={styles.newChatBtn} onClick={() => setMessages([{ role: 'model', text: 'Hello! I am RoohithAI. How can I help you today?' }])}>
          + New Chat
        </button>
      </aside>

      {/* Primary Communication Canvas */}
      <main style={styles.chatArea}>
        <div style={styles.messageContainer}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                ...styles.messageBubble,
                backgroundColor: msg.role === 'user' ? '#2563eb' : '#1e1e24',
                color: '#f3f4f6',
                maxWidth: msg.role === 'user' ? '70%' : '85%',
              }}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.messageRow}>
              <div style={{ ...styles.messageBubble, backgroundColor: '#1e1e24', color: '#9ca3af' }}>
                RoohithAI is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Floating User Input Control Component */}
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Message RoohithAI..."}
              style={{
                ...styles.textInput,
                color: isListening ? '#ff1e27' : '#ffffff'
              }}
              disabled={loading}
            />
            {/* Microphone Button Toggle */}
            <button 
              type="button" 
              onClick={toggleVoiceInput} 
              style={{
                ...styles.micButton,
                boxShadow: isListening ? '0 0 10px #ff1e27' : 'none',
                border: isListening ? '1px solid #ff1e27' : 'none'
              }}
              title="Voice Input"
            >
              {isListening ? '🛑' : '🎙️'}
            </button>
            <button type="submit" style={styles.sendButton} disabled={loading || !input.trim()}>
              ➔
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Fixed styling object
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0b0b0f', 
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#ffffff',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#050507',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRight: '1px solid #1f1f2e',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '4px',
  },
  logoImage: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #ff1e27',
    boxShadow: '0 0 15px rgba(255, 30, 39, 0.7)',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  newChatBtn: {
    backgroundColor: '#1e1e2e',
    color: '#ffffff',
    border: '1px solid #3f3f56',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  messageContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    lineHeight: '1.6',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  codeContainer: {
    backgroundColor: '#050507',
    borderRadius: '8px',
    border: '1px solid #2e2e3f',
    margin: '12px 0',
    overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#14141f',
    padding: '8px 14px',
    borderBottom: '1px solid #2e2e3f',
  },
  codeLang: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
    copyButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  codePre: {
    margin: 0,
    padding: '14px',
    overflowX: 'auto',
    fontFamily: 'Fira Code, Courier New, monospace',
    fontSize: '14px',
    color: '#e5e7eb',
  },
  inputForm: {
    padding: '24px',
    background: 'linear-gradient(180deg, rgba(11,11,15,0) 0%, #0b0b0f 50%)',
  },
  inputWrapper: {
    maxWidth: '768px',
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1e1e24',
    borderRadius: '14px',
    border: '1px solid #3f3f4e',
    padding: '6px 12px',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    padding: '10px 80px 10px 8px',
    fontSize: '15px',
    outline: 'none',
  },
  micButton: {
    position: 'absolute',
    right: '52px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  sendButton: {
    position: 'absolute',
    right: '12px',
    backgroundColor: '#ffffff',
    color: '#0b0b0f',
    border: 'none',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
};

export default App;

