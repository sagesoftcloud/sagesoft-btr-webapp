import React, { useState, useRef, useEffect } from 'react';
import bedrockService from '../services/bedrockService';
import './ChatBot.css';

/**
 * BTR ChatBot Component
 * AI-powered document assistant with regional context awareness
 */
const ChatBot = ({ user, selectedDocument, documentContent }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Get user context
  const userRegion = user?.attributes?.['custom:region'] || 'UNKNOWN';
  const userRole = user?.attributes?.['custom:role'] || 'admin';
  const userName = user?.attributes?.email || 'User';

  useEffect(() => {
    initializeChat();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    if (!user || isInitialized) return;

    const welcomeMessage = {
      type: 'ai',
      content: `Welcome to the Bureau of Treasury AI Assistant, ${userName}!

I'm here to help you with treasury documents and procedures.

Your Access Level: ${userRole === 'super-admin' ? 'Super Administrator (All Regions)' : `Regional Administrator (${userRegion})`}

You can ask me questions about:
• Document analysis and summaries
• Budget allocations and financial data
• Treasury procedures and guidelines
• Regional financial reports
${userRole === 'super-admin' ? '• Cross-regional comparisons and insights' : ''}

How can I assist you today?`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    setIsInitialized(true);

    // Test Bedrock connection
    try {
      await bedrockService.testConnection();
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: 'Note: AI services are currently initializing. Some features may be limited.',
        timestamp: new Date(),
        isWarning: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send question to Bedrock with context
      const aiResponse = await bedrockService.askQuestion(
        inputMessage,
        documentContent,
        userRegion,
        userRole
      );

      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact your system administrator.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "What is the total budget allocation in this document?",
    "Summarize the key financial highlights",
    "What are the main expense categories?",
    userRole === 'super-admin' ? "Compare allocations across regions" : `What is ${userRegion}'s budget status?`
  ];

  if (!user) {
    return (
      <div className="chatbot-container">
        <div className="chatbot-loading">
          <p>Please log in to access the AI Assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>🤖 BTR AI Assistant</h3>
          <span className="user-context">
            {userRole === 'super-admin' ? '👑 Super Admin' : `📍 ${userRegion}`}
          </span>
        </div>
        <div className="connection-status">
          <span className="status-dot active"></span>
          <span>Connected</span>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type} ${message.isError ? 'error' : ''} ${message.isWarning ? 'warning' : ''}`}
          >
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-text">Analyzing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {selectedDocument && (
        <div className="document-context">
          <div className="context-header">
            <span className="context-icon">📄</span>
            <span className="context-text">Analyzing: {selectedDocument}</span>
          </div>
        </div>
      )}

      <div className="quick-questions">
        <div className="quick-questions-header">Quick Questions:</div>
        <div className="quick-questions-buttons">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(question)}
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me about treasury documents${selectedDocument ? ` or "${selectedDocument}"` : ''}...`}
            disabled={isLoading}
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
