import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  margin-left: 0.5rem;
  color: #666;
  font-style: italic;
`;

function LoadingSpinner() {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>AI is thinking...</LoadingText>
    </SpinnerContainer>
  );
}

export default LoadingSpinner;
