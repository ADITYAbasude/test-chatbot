import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// Import schemas
import { chatTypeDefs } from './schemas/chat.js';
import { productTypeDefs } from './schemas/product.js';
import { userTypeDefs } from './schemas/user.js';
import { commonTypeDefs } from './schemas/common.js';

// Import resolvers
import { chatResolvers } from './resolvers/chat.js';
import { productResolvers } from './resolvers/product.js';
import { userResolvers } from './resolvers/user.js';
import { scalarResolvers } from './resolvers/scalars.js';

export async function createSchema() {
  try {
    // Merge all type definitions
    const typeDefs = mergeTypeDefs([
      commonTypeDefs,
      chatTypeDefs,
      productTypeDefs,
      userTypeDefs
    ]);

    // Merge all resolvers
    const resolvers = mergeResolvers([
      scalarResolvers,
      chatResolvers,
      productResolvers,
      userResolvers
    ]);

    // Create executable schema
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    });

    console.log('✅ GraphQL Schema created successfully');
    return schema;

  } catch (error) {
    console.error('❌ Error creating GraphQL schema:', error);
    throw error;
  }
}
