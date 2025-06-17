import { supabase, azureOpenAI } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

// Calculate cosine similarity for scoring
function calculateCosineSimilarity(vecA, vecB) {
  // Check if vectors exist and are arrays
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    // console.log('⚠️ Invalid vectors for similarity calculation');
    return 0;
  }
  
  if (vecA.length !== vecB.length) {
    console.log(`⚠️ Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  // Check for NaN or invalid results
  if (isNaN(similarity)) {
    console.log('⚠️ Similarity calculation resulted in NaN');
    return 0;
  }
  
  return similarity;
}

async function performanceTestWithComplexQueries() {
  console.log('🚀 Performance Test with Complex Queries');
  console.log('=' .repeat(60));
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));
  
  // 15 complex search queries including mechanical keyboard
  const complexQueries = [
    {
      query: 'mechanical keyboard',
      description: 'Direct product match test'
    },
    {
      query: 'RGB backlit mechanical gaming keyboard with custom switches',
      description: 'Detailed product specification'
    },
    {
      query: 'high-performance gaming laptop with RTX graphics card',
      description: 'Specific gaming hardware'
    },
    {
      query: 'wireless noise-canceling headphones for music listening',
      description: 'Audio equipment with features'
    },
    {
      query: 'flagship smartphone with advanced camera system and 5G',
      description: 'Modern phone features'
    },
    {
      query: 'ergonomic office chair with lumbar support for long work sessions',
      description: 'Workplace furniture needs'
    },
    {
      query: 'lightweight athletic running shoes with advanced cushioning',
      description: 'Sports equipment specifics'
    },
    {
      query: 'programmable coffee maker with built-in grinder and thermal carafe',
      description: 'Kitchen appliance features'
    },
    {
      query: 'precision wireless mouse for productivity and gaming',
      description: 'Computer peripheral functionality'
    },
    {
      query: 'fitness tracker with heart rate monitoring and GPS tracking',
      description: 'Health technology features'
    },
    {
      query: 'portable waterproof bluetooth speaker with long battery life',
      description: 'Audio device portability'
    },
    {
      query: 'ultra HD 4K webcam for streaming and professional video calls',
      description: 'Video equipment quality'
    },
    {
      query: 'high-performance tablet with stylus support for digital art',
      description: 'Creative technology tools'
    },
    {
      query: 'computer accessories for gaming setup',
      description: 'Category-based search'
    },
    {
      query: 'affordable electronics under $200 for home office',
      description: 'Budget and location-based search'
    }
  ];

  const performanceResults = [];
  let totalTime = 0;
  let successfulSearches = 0;

  console.log(`\n🧪 Testing ${complexQueries.length} complex queries...\n`);

  for (let i = 0; i < complexQueries.length; i++) {
    const testCase = complexQueries[i];
    console.log(`${i + 1}/15 🔍 Testing: "${testCase.query}"`);
    console.log(`📝 Purpose: ${testCase.description}`);
    console.log('─'.repeat(50));

    try {
      // Start timing
      const startTime = Date.now();
      
      // Generate embedding
      const embeddingStart = Date.now();
      const response = await azureOpenAI.embeddings.create({
        input: testCase.query,
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-large'
      });
      const embeddingTime = Date.now() - embeddingStart;
      
      const queryEmbedding = response.data[0].embedding;
      console.log(`⚡ Embedding generated: ${embeddingTime}ms (${queryEmbedding.length} dims)`);

      // Search products
      const searchStart = Date.now();
      const { data: results, error } = await supabase.rpc('search_products', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2, // Lower threshold for more results
        match_count: 5
      });
      const searchTime = Date.now() - searchStart;
      
      const totalQueryTime = Date.now() - startTime;

      if (error) {
        console.error('❌ Search error:', error.message);
        continue;
      }

      // Record performance
      const perfData = {
        query: testCase.query,
        embeddingTime,
        searchTime,
        totalTime: totalQueryTime,
        resultCount: results.length,
        success: true
      };
      performanceResults.push(perfData);
      totalTime += totalQueryTime;
      successfulSearches++;

      console.log(`⚡ Search completed: ${searchTime}ms`);
      console.log(`⚡ Total time: ${totalQueryTime}ms`);
      console.log(`✅ Found ${results.length} results:`);      if (results.length > 0) {
        results.forEach((product, index) => {
          // Use the built-in similarity_score if available, otherwise calculate it
          let similarity = 0;
          
          if (product.similarity_score !== undefined) {
            // Use the similarity score from the SQL function
            similarity = product.similarity_score;
          } else if (product.embedding && queryEmbedding) {
            // Calculate manually if embeddings are available
            similarity = calculateCosineSimilarity(queryEmbedding, product.embedding);
          } else {
            // Estimate based on search rank (higher rank = lower similarity)
            similarity = Math.max(0, 1 - (index * 0.1)); // Simple ranking-based estimate
          }
            
          console.log(`\n   ${index + 1}. ${product.name}`);
          console.log(`      💰 $${product.price} | 📂 ${product.category}`);
          console.log(`      📝 ${product.description?.substring(0, 100)}...`);
          
          // Store similarity score
          perfData.topSimilarity = index === 0 ? similarity : perfData.topSimilarity || similarity;
        });
      } else {
        console.log('   📭 No results found (try lowering match_threshold)');
      }

    } catch (error) {
      console.error(`❌ Error testing "${testCase.query}":`, error.message);
      performanceResults.push({
        query: testCase.query,
        error: error.message,
        success: false
      });
    }

    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Performance Summary
  console.log('📊 PERFORMANCE ANALYSIS REPORT');
  console.log('=' .repeat(60));
  
  if (successfulSearches === 0) {
    console.log('❌ No successful searches to analyze');
    return;
  }

  const successfulResults = performanceResults.filter(r => r.success);
  
  // Calculate statistics
  const avgEmbeddingTime = successfulResults.reduce((sum, r) => sum + r.embeddingTime, 0) / successfulResults.length;
  const avgSearchTime = successfulResults.reduce((sum, r) => sum + r.searchTime, 0) / successfulResults.length;
  const avgTotalTime = successfulResults.reduce((sum, r) => sum + r.totalTime, 0) / successfulResults.length;
  const avgResultCount = successfulResults.reduce((sum, r) => sum + r.resultCount, 0) / successfulResults.length;
  
  const minTime = Math.min(...successfulResults.map(r => r.totalTime));
  const maxTime = Math.max(...successfulResults.map(r => r.totalTime));
  
  const fastestQuery = successfulResults.find(r => r.totalTime === minTime);
  const slowestQuery = successfulResults.find(r => r.totalTime === maxTime);

  console.log(`\n📈 PERFORMANCE METRICS:`);
  console.log(`   Total Queries: ${complexQueries.length}`);
  console.log(`   Successful: ${successfulSearches} (${((successfulSearches/complexQueries.length)*100).toFixed(1)}%)`);
  console.log(`   Total Test Time: ${totalTime.toFixed(0)}ms`);
  
  console.log(`\n⚡ AVERAGE RESPONSE TIMES:`);
  console.log(`   Embedding Generation: ${avgEmbeddingTime.toFixed(1)}ms`);
  console.log(`   Vector Search: ${avgSearchTime.toFixed(1)}ms`);
  console.log(`   Total Query Time: ${avgTotalTime.toFixed(1)}ms`);
  console.log(`   Average Results per Query: ${avgResultCount.toFixed(1)}`);
  
  console.log(`\n🏆 SPEED ANALYSIS:`);
  console.log(`   Fastest Query: ${minTime}ms`);
  console.log(`   Slowest Query: ${maxTime}ms`);
  console.log(`   Speed Variance: ${(maxTime - minTime)}ms`);
  
  console.log(`\n🔍 SPECIFIC QUERY PERFORMANCE:`);
  console.log(`   Fastest: "${fastestQuery?.query?.substring(0, 40)}..." (${minTime}ms)`);
  console.log(`   Slowest: "${slowestQuery?.query?.substring(0, 40)}..." (${maxTime}ms)`);

  // Find mechanical keyboard specific results
  const mechanicalKeyboardTests = successfulResults.filter(r => 
    r.query.toLowerCase().includes('mechanical') || r.query.toLowerCase().includes('keyboard')
  );
  
  if (mechanicalKeyboardTests.length > 0) {
    console.log(`\n⌨️  MECHANICAL KEYBOARD SEARCH RESULTS:`);
    mechanicalKeyboardTests.forEach(test => {
      console.log(`   Query: "${test.query}"`);
      console.log(`   Time: ${test.totalTime}ms | Results: ${test.resultCount}`);
      console.log(`   Top Similarity: ${test.topSimilarity ? (test.topSimilarity * 100).toFixed(1) + '%' : 'N/A'}`);
    });
  }

  // Performance rating
  console.log(`\n🎯 PERFORMANCE RATING:`);
  if (avgTotalTime < 1000) {
    console.log(`   ⚡ EXCELLENT - Average ${avgTotalTime.toFixed(0)}ms (Sub-second response)`);
  } else if (avgTotalTime < 2000) {
    console.log(`   ✅ GOOD - Average ${avgTotalTime.toFixed(0)}ms (Fast response)`);
  } else if (avgTotalTime < 5000) {
    console.log(`   ⚠️  ACCEPTABLE - Average ${avgTotalTime.toFixed(0)}ms (Moderate response)`);
  } else {
    console.log(`   ❌ SLOW - Average ${avgTotalTime.toFixed(0)}ms (Needs optimization)`);
  }

  console.log(`\n📝 DETAILED RESULTS TABLE:`);
  console.log('─'.repeat(80));
  console.log('Query'.padEnd(40) + 'Time(ms)'.padEnd(10) + 'Results'.padEnd(10) + 'Status');
  console.log('─'.repeat(80));
  
  performanceResults.forEach(result => {
    const queryShort = result.query.substring(0, 37) + (result.query.length > 37 ? '...' : '');
    const timeStr = result.success ? result.totalTime.toString() : 'ERROR';
    const resultStr = result.success ? result.resultCount.toString() : '0';
    const statusStr = result.success ? '✅' : '❌';
    
    console.log(
      queryShort.padEnd(40) + 
      timeStr.padEnd(10) + 
      resultStr.padEnd(10) + 
      statusStr
    );
  });

  console.log('─'.repeat(80));
  console.log(`\n🎉 Performance test completed!`);
  console.log(`📊 Average response time: ${avgTotalTime.toFixed(1)}ms across ${successfulSearches} queries`);
}

// Run the performance test
performanceTestWithComplexQueries().catch(console.error);
