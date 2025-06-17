import { supabase, azureOpenAI } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

async function testMechanicalKeyboard() {
  console.log('⌨️  Testing Mechanical Keyboard Search');
  console.log('=' .repeat(50));
  
  const queries = [
    'mechanical keyboard',
    'RGB backlit mechanical gaming keyboard',
    'keyboard with custom switches',
    'gaming keyboard mechanical',
    'keyboard for gaming and productivity'
  ];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n${i + 1}/5 🔍 Query: "${query}"`);
    console.log('─'.repeat(40));
    
    try {
      const startTime = Date.now();
      
      // Generate embedding
      const response = await azureOpenAI.embeddings.create({
        input: query,
        model: 'text-embedding-3-large'
      });
      
      const embeddingTime = Date.now() - startTime;
      const queryEmbedding = response.data[0].embedding;
      
      // Search products
      const searchStart = Date.now();
      const { data: results, error } = await supabase.rpc('search_products', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 3
      });
      
      const searchTime = Date.now() - searchStart;
      const totalTime = Date.now() - startTime;
      
      if (error) {
        console.error('❌ Error:', error.message);
        continue;
      }
      
      console.log(`⚡ Total time: ${totalTime}ms (Embedding: ${embeddingTime}ms, Search: ${searchTime}ms)`);
      console.log(`✅ Found ${results.length} results:`);
      
      results.forEach((product, index) => {
        console.log(`\n   ${index + 1}. ${product.name}`);
        console.log(`      💰 $${product.price} | 📂 ${product.category}`);
        console.log(`      📝 ${product.description?.substring(0, 70)}...`);
      });
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n⌨️  Mechanical keyboard test completed!');
}

testMechanicalKeyboard();
