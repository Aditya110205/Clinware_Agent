import { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        type: 'agent', 
        text: data.response || 'No response received' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'agent', 
        text: '❌ Error: Unable to connect. Make sure backend is running on http://localhost:8080' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: '#0f172a',
      color: '#e5e7eb',
      lineHeight: 1.6,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* HERO SECTION */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0c1425 100%)',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
            color: '#38bdf8', 
            margin: 0,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Clinware Market Intelligence Researcher
          </h1>
          <p style={{ 
            marginTop: '25px', 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: '#94a3b8',
            maxWidth: '700px',
            margin: '25px auto 0',
            lineHeight: 1.6
          }}>
            AI-powered news analysis for strategic business decisions
          </p>
          <span style={{
            display: 'inline-block',
            marginTop: '30px',
            padding: '12px 24px',
            border: '1px solid #334155',
            borderRadius: '25px',
            fontSize: '1rem',
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8'
          }}>
            Java • Google GenAI • MCP News Server
          </span>
        </div>
      </section>

      {/* INTERACTIVE CHAT */}
      <section style={{ 
        padding: '60px 20px', 
        background: '#0f172a'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#38bdf8', 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
          marginBottom: '40px',
          fontWeight: 600
        }}>
          Ask the Agent
        </h2>
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            border: '1px solid #334155',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Messages */}
            <div style={{
              minHeight: '500px',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '25px',
              background: '#0f172a',
              scrollbarWidth: 'thin',
              scrollbarColor: '#334155 #0f172a'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0c1425 100%)',
                  padding: '35px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  borderLeft: '4px solid #38bdf8'
                }}>
                  <h3 style={{ 
                    color: '#38bdf8', 
                    marginBottom: '15px',
                    fontSize: '1.3rem',
                    fontWeight: 600
                  }}>
                    👋 Welcome!
                  </h3>
                  <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                    Ask me anything about Clinware:
                  </p>
                  <ul style={{ 
                    marginTop: '15px', 
                    marginLeft: '20px',
                    color: '#94a3b8',
                    lineHeight: 1.8
                  }}>
                    <li>Latest news and developments</li>
                    <li>Funding and financial information</li>
                    <li>Products and market position</li>
                  </ul>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease-in'
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: msg.type === 'user' 
                        ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)' 
                        : '#1e293b',
                      color: msg.type === 'user' ? '#000' : '#e5e7eb',
                      border: msg.type === 'agent' ? '1px solid #334155' : 'none',
                      boxShadow: msg.type === 'user' 
                        ? '0 4px 6px -1px rgba(56, 189, 248, 0.3)' 
                        : '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '0.85rem', 
                        marginBottom: '10px', 
                        opacity: 0.9,
                        color: msg.type === 'user' ? '#000' : '#38bdf8'
                      }}>
                        {msg.type === 'user' ? '👤 You' : '🤖 Agent'}
                      </div>
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div style={{ 
                  padding: '16px 20px', 
                  background: '#1e293b', 
                  borderRadius: '12px', 
                  width: 'fit-content',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  fontWeight: 500
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    🤔 Thinking...
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ 
              padding: '20px 25px', 
              background: '#1e293b', 
              borderTop: '1px solid #334155' 
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask about market intelligence..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    background: '#0f172a',
                    border: `2px solid ${inputFocused ? '#38bdf8' : '#334155'}`,
                    borderRadius: '10px',
                    color: '#e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '14px 35px',
                    background: loading || !input.trim() 
                      ? '#334155' 
                      : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                    color: loading || !input.trim() ? '#64748b' : '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: loading || !input.trim() 
                      ? 'none' 
                      : '0 4px 6px -1px rgba(56, 189, 248, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && input.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(56, 189, 248, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = loading || !input.trim() 
                      ? 'none' 
                      : '0 4px 6px -1px rgba(56, 189, 248, 0.3)';
                  }}
                >
                  {loading ? '⏳' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        background: '#0c1425'
      }}>
        <h2 style={{ 
          color: '#38bdf8', 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
          marginBottom: '40px',
          fontWeight: 600
        }}>
          What This Agent Does
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {[
            { icon: '📰', text: 'Fetches real-time market news' },
            { icon: '📊', text: 'Summarizes key business insights' },
            { icon: '📈', text: 'Identifies trends & risks' },
            { icon: '✅', text: 'Delivers executive-ready analysis' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                padding: '30px 25px',
                borderRadius: '12px',
                border: '1px solid #334155',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(56, 189, 248, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{item.icon}</div>
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE OUTPUT */}
      <section style={{ 
        padding: '60px 20px', 
        background: '#0f172a'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#38bdf8', 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
          marginBottom: '40px',
          fontWeight: 600
        }}>
          Sample AI Output
        </h2>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#1e293b',
          padding: '40px',
          borderLeft: '4px solid #38bdf8',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ 
            color: '#38bdf8', 
            marginBottom: '18px',
            fontSize: '1.4rem',
            fontWeight: 600
          }}>
            Industry: Healthcare Technology
          </h3>
          <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem' }}>
            Recent developments indicate accelerated adoption of AI-driven diagnostics.
            Major players are increasing R&D spending, signaling competitive expansion.
          </p>
          <span style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '8px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #22c55e',
            borderRadius: '20px',
            color: '#22c55e',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            ✓ Confidence Level: High
          </span>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        background: '#0c1425'
      }}>
        <h2 style={{ 
          color: '#38bdf8', 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
          marginBottom: '40px',
          fontWeight: 600
        }}>
          System Architecture
        </h2>
        <div style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          background: '#1e293b',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          {[
            '🔧 Java AI Agent (Google GenAI SDK)',
            '📡 MCP News Server for live data',
            '💡 Prompt-based insight generation',
            '🏗️ Scalable modular design'
          ].map((text, idx) => (
            <div key={idx} style={{ 
              margin: '15px 0', 
              fontSize: '1.1rem',
              color: '#cbd5e1',
              textAlign: 'left',
              padding: '12px 0',
              borderBottom: idx < 3 ? '1px solid #334155' : 'none'
            }}>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '25px 20px',
        textAlign: 'center',
        background: '#0c1425',
        fontSize: '0.9rem',
        borderTop: '1px solid #334155',
        color: '#64748b'
      }}>
        Built with Java, Google GenAI & MCP
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}