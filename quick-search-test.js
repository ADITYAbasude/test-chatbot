import { supabase, azureOpenAI } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

// Quick test for search functionality
async function quickSearchTest() {
  console.log('🔍 Quick Vector Search Test\n');

  try {    // 1. Check if we have products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, embedding')
      .limit(10);

    if (productError) {
      console.error('❌ Cannot access products table:', productError.message);
      return;
    }

    console.log(`✅ Products in database: ${products.length}`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Run: npm run populate');
      return;
    }

    // Check if products have embeddings
    const productsWithEmbeddings = products.filter(p => p.embedding);
    console.log(`🎯 Products with embeddings: ${productsWithEmbeddings.length}/${products.length}`);

    if (productsWithEmbeddings.length === 0) {
      console.log('⚠️  No embeddings found. Run: npm run populate');
      return;
    }

    // 2. Test search function with a simple query
    console.log('\n🔍 Testing search with query: "laptop computer"');
    
    // Generate embedding
    const response = await azureOpenAI.embeddings.create({
      input: 'laptop computer gaming',
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-large'
    });

    const queryEmbedding = response.data[0].embedding;
    console.log(`✅ Generated embedding (${queryEmbedding.length} dimensions)`);

    // Search products
    const { data: results, error: searchError } = await supabase.rpc('search_products', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 3
    });

    if (searchError) {
      console.error('❌ Search failed:', searchError.message);
      console.log('💡 Make sure you have created the search_products function in Supabase');
      return;
    }

    console.log(`✅ Search successful! Found ${results.length} results:`);
    
    results.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      💰 $${product.price} | 📂 ${product.category}`);
      console.log(`      📝 ${product.description?.substring(0, 80)}...`);
    });

    console.log('\n🎉 Quick test completed successfully!');
    console.log('🚀 Run "npm run test-search" for comprehensive testing');

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    
    if (error.message.includes('embedding')) {
      console.log('💡 Check your Azure OpenAI configuration in .env file');
    } else if (error.message.includes('products')) {
      console.log('💡 Run: npm run populate');
    } else if (error.message.includes('search_products')) {
      console.log('💡 Create the search_products function in Supabase SQL Editor');
    }
  }
}

quickSearchTest();
