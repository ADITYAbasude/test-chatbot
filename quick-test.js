import { createSchema } from './src/graphql/index.js';
import { createContext } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

async function quickTest() {
  console.log('🧪 Quick Server Test\n');
  
  try {
    console.log('1. Testing environment variables...');
    console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
    
    console.log('\n2. Testing GraphQL schema creation...');
    const schema = await createSchema();
    console.log('   ✅ Schema created successfully');
    
    console.log('\n3. Testing context creation...');
    const mockReq = { headers: {} };
    const context = createContext({ req: mockReq });
    console.log('   ✅ Context created successfully');
    
    console.log('\n🎉 All tests passed! Server should start correctly.');
    console.log('\n🚀 Run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  }
}

quickTest();
