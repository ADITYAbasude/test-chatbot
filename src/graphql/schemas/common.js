import { gql } from 'apollo-server-express';
import GraphQLJSON from 'graphql-type-json';

export const commonTypeDefs = gql`
  scalar JSON
  # scalar Upload  # Temporarily commented out until file upload is properly configured

  directive @auth on FIELD_DEFINITION

  type Query {
    hello: String!
    health: HealthStatus!
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }

  type HealthStatus {
    status: String!
    timestamp: String!
    services: ServiceStatus!
    version: String!
  }

  type ServiceStatus {
    supabase: Boolean!
    openai: Boolean!
    redis: Boolean
  }
`;
