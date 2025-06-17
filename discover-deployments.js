import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function discoverDeployments() {
  console.log('🔍 Discovering Available Azure OpenAI Deployments...\n');
  
  try {
    const client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    });
    
    console.log('✅ Successfully connected to Azure OpenAI');
    console.log(`   Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
    console.log('');
    
    // Test the embedding deployment that we know exists
    console.log('🔍 Testing embedding deployment: text-embedding-3-large');
    try {
      const embeddingResponse = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: ["test"]
      });
      console.log('✅ Embedding deployment works!');
      console.log(`   Embedding dimension: ${embeddingResponse.data[0].embedding.length}`);
    } catch (error) {
      console.log('❌ Embedding deployment failed:', error.message);
    }
    console.log('');
    
    // Test common chat deployment names
    const commonChatDeployments = [
      'gpt-35-turbo',
      'gpt-3.5-turbo', 
      'gpt-4',
      'gpt-4o',
      'gpt-35-turbo-16k',
      'text-embedding-3-large' // Sometimes this is used for both
    ];
    
    console.log('🤖 Testing common chat deployment names:');
    for (const deployment of commonChatDeployments) {
      try {
        console.log(`   Testing: ${deployment}...`);
        const response = await client.chat.completions.create({
          model: deployment,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        });
        console.log(`   ✅ ${deployment} - WORKS!`);
        break; // Found a working deployment
      } catch (error) {
        console.log(`   ❌ ${deployment} - ${error.message.slice(0, 50)}...`);
      }
    }
    
    console.log('\n💡 Recommendation:');
    console.log('   1. Check your Azure OpenAI Studio for actual deployment names');
    console.log('   2. Visit: https://oai.azure.com/portal/');
    console.log('   3. Go to "Deployments" tab to see your model deployments');
    console.log('   4. Update the .env file with correct deployment names');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

discoverDeployments();
