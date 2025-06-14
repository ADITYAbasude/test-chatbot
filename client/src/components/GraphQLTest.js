import React from 'react';
import { useQuery, gql } from '@apollo/client';

const HEALTH_CHECK = gql`
  query HealthCheck {
    health {
      status
      timestamp
      services {
        supabase
        openai
      }
    }
    hello
  }
`;

function GraphQLTest() {
  const { loading, error, data } = useQuery(HEALTH_CHECK);

  if (loading) return <div>Loading GraphQL test...</div>;
  
  if (error) {
    return (
      <div style={{ padding: '20px', background: '#fee', border: '1px solid #f00', margin: '20px' }}>
        <h3>GraphQL Connection Error:</h3>
        <p>{error.message}</p>
        <details>
          <summary>Full Error Details</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#efe', border: '1px solid #0a0', margin: '20px' }}>
      <h3>✅ GraphQL Connection Successful!</h3>
      <p><strong>Hello:</strong> {data.hello}</p>
      <p><strong>Status:</strong> {data.health.status}</p>
      <p><strong>Timestamp:</strong> {data.health.timestamp}</p>
      <h4>Services:</h4>
      <ul>
        <li>Supabase: {data.health.services.supabase ? '✅ Connected' : '❌ Not connected'}</li>
        <li>OpenAI: {data.health.services.openai ? '✅ Connected' : '❌ Not connected'}</li>
      </ul>
    </div>
  );
}

export default GraphQLTest;
