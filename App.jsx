import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

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
          systemInstruction: "Your name is RoohithAI. You are a highly advanced AI assistant created by Roohith and powered by Google models."
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

  // Modernized Custom Markdown Renderer Components Object
  const markdownComponents = {
    // Intercept default rendering blocks to injection code wrapper blocks
    code({ node, inline, className, children, ...props }) {
      const codeText = String(children).trim();
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'code';

      if (!inline) {
        return (
          <div style={styles.codeContainer}>
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
              <code {...props}>{children}</code>
            </pre>
          </div>
        );
      }
      return <code style={{ backgroundColor: '#2e2e38', padding: '2px 6px', borderRadius: '4px' }} {...props}>{children}</code>;
    },
    // Make headers cleanly break down without squishing lines
    h1: ({children}) => <h1 style={{ margin: '14px 0 6px 0', fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{children}</h1>,
    h2: ({children}) => <h2 style={{ margin: '12px 0 6px 0', fontSize: '1.3rem', fontWeight: '700', color: '#ffffff' }}>{children}</h2>,
    h3: ({children}) => <h3 style={{ margin: '10px 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>{children}</h3>,
    h4: ({children}) => <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>{children}</h4>,
    // Fix native markdown blocks into formatted standard breaks
    p: ({children}) => <p style={{ margin: '0 0 10px 0', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{children}</p>,
    ul: ({children}) => <ul style={{ margin: '0 0 10px 20px', paddingLeft: '5px' }}>{children}</ul>,
    ol: ({children}) => <ol style={{ margin: '0 0 10px 20px', paddingLeft: '5px' }}>{children}</ol>,
    li: ({children}) => <li style={{ margin: '4px 0', lineHeight: '1.5' }}>{children}</li>,
    strong: ({children}) => <strong style={{ fontWeight: '700', color: '#ffffff' }}>{children}</strong>
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
                {/* Advanced Markdown rendering core injection element layout mapping link hooks */}
                <Markdown components={markdownComponents}>{msg.text}</Markdown>
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

// Complete inline layout styles definition matching original workspace structure
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
  },
  logoImage: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.025em',
    margin: 0,
  },
  newChatBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#1c1c24',
    border: '1px solid #2e2e3d',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    backgroundColor: '#0c0c12',
  },
  messageContainer: {
    flex: 1,
    padding: '24px 24px 100px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }
    messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    padding: '14px 18px',
    borderRadius: '12px',
    fontSize: '0.975rem',
    lineHeight: '1.5',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    wordBreak: 'break-word',
  },
  inputForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '24px',
    background: 'linear-gradient(transparent, #0c0c12 30%)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#16161f',
    border: '1px solid #2a2a3a',
    borderRadius: '24px',
    padding: '6px 12px 6px 18px',
    gap: '8px',
  },
  textInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    padding: '8px 0',
  },
  micButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
  },
  sendButton: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  codeContainer: {
    margin: '12px 0',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #2e2e3d',
    backgroundColor: '#050507',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#14141b',
    borderBottom: '1px solid #2e2e3d',
  },
  codeLang: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  codePre: {
    margin: 0,
    padding: '14px',
    overflowX: 'auto',
    backgroundColor: '#050507',
  }
};

export default App;
