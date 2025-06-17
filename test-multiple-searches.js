import { supabase, azureOpenAI } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

async function testMultipleSearches() {
  console.log('🧪 Testing Multiple Search Queries\n');

  const queries = [
    'laptop computer gaming',
    'wireless headphones music',
    'smartphone phone mobile',
    'office chair desk furniture',
    'running shoes athletic'
  ];

  for (const query of queries) {
    console.log(`🔍 Searching for: "${query}"`);
    
    try {
      // Generate embedding
      const response = await azureOpenAI.embeddings.create({
        input: query,
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-large'
      });

      const queryEmbedding = response.data[0].embedding;

      // Search products
      const { data: results, error } = await supabase.rpc('search_products', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });

      if (error) {
        console.error('❌ Search error:', error.message);
        continue;
      }

        
    results.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      💰 $${product.price} | 📂 ${product.category}`);
      console.log(`      📝 ${product.description?.substring(0, 80)}...`);
    });
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎉 Multi-search test completed!');
}

testMultipleSearches();
