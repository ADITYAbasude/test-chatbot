import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  justify-content: ${props => props.isBot ? 'flex-start' : 'flex-end'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background: ${props => props.isBot 
    ? props.isError ? '#f8d7da' : '#f8f9fa'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: ${props => props.isBot 
    ? props.isError ? '#721c24' : '#333'
    : 'white'
  };
  border: ${props => props.isError ? '1px solid #f5c6cb' : 'none'};
  word-wrap: break-word;
  
  ${props => props.isBot && `
    border-bottom-left-radius: 4px;
  `}
  
  ${props => !props.isBot && `
    border-bottom-right-radius: 4px;
  `}
`;

const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: #666;
  justify-content: ${props => props.isBot ? 'flex-start' : 'flex-end'};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isBot 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#28a745'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  margin: ${props => props.isBot ? '0 0.5rem 0 0' : '0 0 0 0.5rem'};
`;

const MessageContent = styled.div`
  flex: 1;
`;

function ChatMessage({ message }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <MessageContainer isBot={message.isBot}>
      {message.isBot && (
        <Avatar isBot={true}>
          🤖
        </Avatar>
      )}
      
      <MessageContent>
        <MessageInfo isBot={message.isBot}>
          <span>{message.isBot ? 'AI Assistant' : 'You'}</span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </MessageInfo>
        <MessageBubble 
          isBot={message.isBot} 
          isError={message.isError}
        >
          {message.text}
        </MessageBubble>
      </MessageContent>
      
      {!message.isBot && (
        <Avatar isBot={false}>
          👤
        </Avatar>
      )}
    </MessageContainer>
  );
}

export default ChatMessage;
