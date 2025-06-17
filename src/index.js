import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import GraphQL schema and resolvers
import { createSchema } from './graphql/index.js';
import { createContext } from './utils/context.js';

// Configure environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  try {
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));
    
    app.use(morgan('combined'));
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Create GraphQL schema
    const schema = await createSchema();

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
      context: createContext,
      plugins: [
        {
          requestDidStart() {
            return {
              didResolveOperation(requestContext) {
                console.log('GraphQL Operation:', requestContext.request.operationName);
              },
              didEncounterErrors(requestContext) {
                console.log('GraphQL Errors:', requestContext.errors);
              }
            };
          }
        }
      ],
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          path: error.path
        };
      },
      introspection: true,
      playground: process.env.NODE_ENV !== 'production'
    });

    // Start Apollo Server
    await server.start();
    
    // Apply Apollo GraphQL middleware
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false // We handle CORS above
    });    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),        services: {
          supabase: !!process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url_here',
          azureOpenAI: !!process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT
        },
        graphql: server.graphqlPath
      });
    });

    // API info endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'ChatBot Advanced GraphQL Server',
        version: '1.0.0',
        graphql: server.graphqlPath,
        playground: server.graphqlPath,
        health: '/health',
        subscriptions: `/graphql`,
        features: [          'Apollo Server Express',
          'GraphQL Subscriptions',
          'File Upload Support',
          'JWT Authentication Ready',          'Supabase Integration',
          'Azure OpenAI Integration',
          'Real-time Chat'
        ]
      });
    });

    // Create HTTP server
    const httpServer = createServer(app);

    // Setup subscriptions
    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect: (connectionParams, webSocket, context) => {
          console.log('WebSocket connected');
          return createContext({ connection: { context: connectionParams } });
        },
        onDisconnect: (webSocket, context) => {
          console.log('WebSocket disconnected');
        }
      },
      {
        server: httpServer,
        path: server.graphqlPath
      }
    );

    // Shutdown handling
    const shutdown = () => {
      subscriptionServer.close();
      httpServer.close();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Start server
    const PORT = process.env.PORT || 4000;
    
    httpServer.listen(PORT, () => {
      console.log('🚀 Advanced ChatBot GraphQL Server Started!');
      console.log('');
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🔄 GraphQL Subscriptions: ws://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📖 API Info: http://localhost:${PORT}/`);
      console.log('');      console.log('🔧 Configuration Status:');
      console.log(`   Supabase: ${!!process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url_here' ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`   Azure OpenAI: ${!!process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT ? '✅ Configured' : '❌ Not configured'}`);
      console.log('');
      console.log('🎯 Features Enabled:');
      console.log('   ✅ Apollo Server Express');
      console.log('   ✅ GraphQL Subscriptions');
      console.log('   ✅ File Upload Support');
      console.log('   ✅ JWT Authentication Ready');
      console.log('   ✅ Real-time Chat');
      console.log('   ✅ Advanced Error Handling');
      console.log('   ✅ Request Logging');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
