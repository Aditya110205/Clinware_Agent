import { useState } from 'react';

export default function App() {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    document.body.style.background = '#0f172a';
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
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
    fontFamily: '"Segoe UI", sans-serif',
    background: '#0f172a',
    color: '#e5e7eb',
    lineHeight: 1.6,
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden'
  }}>
    
    {/* CENTERED WRAPPER FOR ALL CONTENT */}
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      padding: '0 20px'
    }}>
    
      {/* HERO SECTION */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e293b, #020617)',
        borderRadius: '0 0 20px 20px',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#38bdf8', margin: 0 }}>
          Market Intelligence Researcher
        </h1>
        <p style={{ marginTop: '10px', fontSize: '1.2rem' }}>
          AI-powered news analysis for strategic business decisions
        </p>
        <span style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '8px 16px',
          border: '1px solid #38bdf8',
          borderRadius: '20px',
          fontSize: '0.9rem'
        }}>
          Java • Google GenAI • MCP News Server
        </span>
      </section>

      {/* INTERACTIVE CHAT */}
      <section style={{ padding: '40px 20px', marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>
          Ask the Agent
        </h2>
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#020617',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          overflow: 'hidden'
        }}>
          {/* Messages */}
          <div style={{
            minHeight: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '20px',
            background: '#0f172a'
          }}>
            {messages.length === 0 ? (
              <div style={{
                background: '#020617',
                padding: '30px',
                borderRadius: '10px',
                borderLeft: '4px solid #38bdf8'
              }}>
                <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>👋 Welcome!</h3>
                <p>Ask me anything about Clinware:</p>
                <ul style={{ marginTop: '15px', marginLeft: '20px' }}>
                  <li>Latest news and developments</li>
                  <li>Funding and financial information</li>
                  <li>Products and market position</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '15px',
                    borderRadius: '10px',
                    background: msg.type === 'user' ? '#38bdf8' : '#020617',
                    color: msg.type === 'user' ? '#000' : '#e5e7eb',
                    borderLeft: msg.type === 'agent' ? '4px solid #22c55e' : 'none'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', opacity: 0.8 }}>
                      {msg.type === 'user' ? '👤 You' : '🤖 Agent'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ padding: '15px', background: '#020617', borderRadius: '10px', width: 'fit-content', borderLeft: '4px solid #22c55e' }}>
                🤔 Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '20px', background: '#020617', borderTop: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about market intelligence..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  background: '#0f172a',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = '#1e293b'}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 30px',
                  background: '#38bdf8',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1
                }}
              >
                {loading ? '⏳' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>
          What This Agent Does
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            'Fetches real-time market news',
            'Summarizes key business insights',
            'Identifies trends & risks',
            'Delivers executive-ready analysis'
          ].map((text, idx) => (
            <div
              key={idx}
              style={{
                background: '#020617',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #1e293b',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE OUTPUT */}
      <section style={{ padding: '40px 20px', background: '#020617', borderRadius: '20px', marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>
          Sample AI Output
        </h2>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: '#0f172a',
          padding: '30px',
          borderLeft: '4px solid #38bdf8',
          borderRadius: '10px'
        }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>
            Industry: Healthcare Technology
          </h3>
          <p>
            Recent developments indicate accelerated adoption of AI-driven diagnostics.
            Major players are increasing R&D spending, signaling competitive expansion.
          </p>
          <span style={{
            display: 'block',
            marginTop: '15px',
            color: '#22c55e',
            fontWeight: 600
          }}>
            Confidence Level: High
          </span>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>
          System Architecture
        </h2>
        <ul style={{ listStyle: 'none', marginTop: '20px', maxWidth: '600px', margin: '0 auto' }}>
          {[
            'Java AI Agent (Google GenAI SDK)',
            'MCP News Server for live data',
            'Prompt-based insight generation',
            'Scalable modular design'
          ].map((text, idx) => (
            <li key={idx} style={{ margin: '10px 0', fontSize: '1.1rem' }}>
              {text}
            </li>
          ))}
        </ul>
      </section>

    </div> {/* END OF CENTERED WRAPPER */}

    {/* FOOTER - Full Width */}
    <footer style={{
      padding: '20px',
      textAlign: 'center',
      background: '#020617',
      fontSize: '0.85rem',
      borderTop: '1px solid #1e293b',
      marginTop: '40px'
    }}>
      <p>Built by Aditya Chaudhari | Cloud & DevOps Aspirant</p>
    </footer>
  </div>
)};