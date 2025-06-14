import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import styled from 'styled-components';
import ChatMessage from './components/ChatMessage';
import ProductCard from './components/ProductCard';
import LoadingSpinner from './components/LoadingSpinner';
import GraphQLTest from './components/GraphQLTest';

// GraphQL Queries and Mutations
const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      success
      message
      conversationId
      aiResponse {
        text
        confidence
        intent
        sentiment {
          score
          label
        }
      }
      products {
        id
        name
        description
        price
        category
      }
      suggestions
      timestamp
    }
  }
`;

const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: ProductSearchInput!) {
    searchProducts(input: $input) {
      products {
        id
        name
        description
        price
        category
      }
      total
      hasMore
    }
  }
`;

const GET_CONVERSATION_HISTORY = gql`
  query GetConversationHistory($userId: String!, $limit: Int) {
    getConversationHistory(userId: $userId, limit: $limit) {
      id
      userId
      userMessage
      aiResponse
      timestamp
      products {
        id
        name
        description
        price
        category
      }
    }
  }
`;

// Styled Components
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  text-align: center;
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
`;

const ProductsPanel = styled.div`
  width: 300px;
  background: white;
  border-left: 1px solid #e9ecef;
  padding: 1rem;
  overflow-y: auto;
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.1rem;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e9ecef;
  gap: 0.5rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuggestionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const SuggestionChip = styled.button`
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
`;

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI shopping assistant. How can I help you find the perfect product today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentProducts, setCurrentProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([
    "Show me trending products",
    "I need help finding a gift",
    "What are your best deals?",
    "Help me find electronics"
  ]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
    const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      const response = data.sendMessage;
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: response.aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        confidence: response.aiResponse.confidence,
        intent: response.aiResponse.intent,
        sentiment: response.aiResponse.sentiment
      }]);
      
      // Update products if any found
      if (response.products && response.products.length > 0) {
        setCurrentProducts(response.products);
      }
      
      // Update suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      }]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || sendingMessage) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Send to backend with correct input format
    try {
      await sendMessage({
        variables: {
          input: {
            message: messageText,
            userId: userId,
            conversationId: null,
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'web'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };
  return (
    <ChatContainer>
      <GraphQLTest />
      <Header>
        <h1>🛍️ AI Shopping Assistant</h1>
        <p>Your personal shopping companion powered by AI</p>
      </Header>
      
      <ChatArea>
        <MessagesContainer>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}
          {sendingMessage && <LoadingSpinner />}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        <ProductsPanel>
          <h3>Recommended Products</h3>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Products will appear here based on your conversation
            </p>
          )}
        </ProductsPanel>
      </ChatArea>
      
      <InputContainer>
        <MessageInput
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about products..."
          disabled={sendingMessage}
        />
        <SendButton
          onClick={() => handleSendMessage()}
          disabled={sendingMessage || !inputValue.trim()}
        >
          {sendingMessage ? 'Sending...' : 'Send'}
        </SendButton>
      </InputContainer>
      
      {suggestions.length > 0 && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <SuggestionsContainer>
            {suggestions.map((suggestion, index) => (
              <SuggestionChip
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </SuggestionChip>
            ))}
          </SuggestionsContainer>
        </div>
      )}
    </ChatContainer>
  );
}

export default App;
