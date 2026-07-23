import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

const ChatCoach = ({ energyLevel, tasks, onAddTask }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am Aura. How can I help you organize your day?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          currentEnergy: energyLevel
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') {
              setIsTyping(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[assistantMessageIndex].content = `Error: ${parsed.error}`;
                  return newMsgs;
                });
                setIsTyping(false);
                return;
              }
              if (parsed.text) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[assistantMessageIndex].content += parsed.text;
                  return newMsgs;
                });
              }
            } catch (err) {
              console.error('Error parsing SSE chunk:', err, data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[assistantMessageIndex].content = "Sorry, I couldn't connect to the server. Is the backend running and API key configured?";
        return newMsgs;
      });
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="chat-header">
        <Bot size={24} color="var(--accent-color)" />
        <h2>Aura Coach</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask Aura or paste meeting notes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="chat-submit" disabled={isTyping || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </>
  );
};

export default ChatCoach;
