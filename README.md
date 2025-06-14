# AI Chatbot - Testing Project

A simple AI chatbot with GraphQL backend and React frontend for testing concepts before production implementation.

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Add your API keys to .env:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_gemini_api_key  # Actually uses Gemini AI
```

### 2. Install & Run
```bash
# Install dependencies
npm install && cd client && npm install && cd ..

# Test Gemini AI connection
npm run test-gemini

# Start both server and client
npm run dev-all
```

### 3. Access
- **Frontend**: http://localhost:3000
- **GraphQL**: http://localhost:4000/graphql

## 🧪 Test Features

- ✅ AI chat responses (powered by **Gemini 1.5 Flash**)
- ✅ Product search 
- ✅ Real-time suggestions
- ✅ GraphQL integration

## 📁 Structure

```
├── src/                 # GraphQL server (with Gemini AI)
├── client/             # React frontend  
├── .env               # Environment variables
└── package.json       # Server dependencies
```

## 🔧 Commands

```bash
npm run dev-all        # Start both server & client
npm run dev           # Server only
npm run client        # Client only
npm run test-gemini   # Test Gemini AI connection
npm run quick-test    # Test server setup
```

## 💡 Notes

- Testing project - not production ready
- Uses **Google Gemini AI** instead of OpenAI
- Uses mock embeddings for product search
- Perfect for prototyping AI chat features

## 🔍 Vector Search Explained

### What is Vector Search?
Vector search (also called semantic search) allows finding products based on **meaning** rather than just keywords. Instead of exact word matching, it understands the context and intent.

### How It Works

#### 1. Traditional Keyword Search (Limited)
```sql
-- Only finds exact matches
SELECT * FROM products 
WHERE description LIKE '%gaming%' AND description LIKE '%laptop%'
```
**Problems**: 
- Misses synonyms like "performance computer"
- No understanding of context
- Poor user experience

#### 2. Vector/Embedding Search (Smart)
```javascript
// User message: "I need a gaming laptop"
const messageEmbedding = await generateEmbedding(message);
// Converts text to numbers: [0.1, 0.8, 0.2, -0.4, ...]

// Search for similar product embeddings
const products = await supabase.rpc('search_products', {
  query_embedding: messageEmbedding,
  match_threshold: 0.6,  // Similarity score (0-1)
  match_count: 5         // Max results
});
```

#### 3. Example Comparisons

| User Query | Keyword Search | Vector Search |
|------------|----------------|---------------|
| "gaming laptop" | ✅ "Gaming Laptop Pro" | ✅ "Gaming Laptop Pro" |
| | ❌ "Performance Notebook" | ✅ "Performance Notebook" |
| | ❌ "High-end Computer" | ✅ "High-end Computer" |
| "cheap phone" | ✅ "Cheap Phone XL" | ✅ "Cheap Phone XL" |
| | ❌ "Budget Smartphone" | ✅ "Budget Smartphone" |
| | ❌ "Affordable Mobile" | ✅ "Affordable Mobile" |

### Current Implementation

```javascript
// In AIService.js - Currently using a fallback
static async generateEmbedding(text) {
  // ⚠️ DEMO ONLY: Simple hash-based embedding
  console.warn('Using fallback embedding - consider implementing Vertex AI embeddings for production');
  
  // Creates a basic vector representation
  const words = text.toLowerCase().split(' ');
  const embedding = new Array(1536).fill(0);
  
  // Simple character-based hashing
  for (let word of words) {
    for (let char of word) {
      embedding[char.charCodeAt(0) % 1536] += 1;
    }
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}
```

### Production Upgrades

For real applications, replace the fallback with proper embeddings:

#### Option A: Google Vertex AI (Recommended)
```javascript
import { VertexAI } from '@google-cloud/vertexai';

static async generateEmbedding(text) {
  const vertexAI = new VertexAI({
    project: 'your-project-id', 
    location: 'us-central1'
  });
  
  const model = vertexAI.getGenerativeModel({
    model: 'textembedding-gecko'
  });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
}
```

#### Option B: Hugging Face
```javascript
static async generateEmbedding(text) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', 
    {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` 
      },
      body: JSON.stringify({ inputs: text })
    }
  );
  return await response.json();
}
```

#### Option C: Disable Vector Search (Simple)
```javascript
// Use basic text search instead
const { data: products } = await supabase
  .from('products')
  .select('*')
  .textSearch('name,description', message, { type: 'websearch' })
  .limit(5);
```

### Database Setup for Vector Search

Your Supabase database needs the `vector` extension:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Products table with embeddings
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2),
  category text,
  embedding vector(1536),  -- Vector column for embeddings
  created_at timestamp DEFAULT now()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_products(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS setof products
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM products
  WHERE embedding <#> query_embedding < -match_threshold
  ORDER BY embedding <#> query_embedding
  LIMIT match_count;
$$;
```

### Benefits of Vector Search

✅ **Semantic Understanding**: Finds products by meaning, not just words  
✅ **Better UX**: Users can ask naturally like "budget gaming setup"  
✅ **Multilingual**: Works across different languages  
✅ **Fuzzy Matching**: Handles typos and variations  
✅ **Context Aware**: Understands "laptop for gaming" vs "laptop for work"  

---
*Simple setup for testing GraphQL + Gemini AI chatbot concepts* 🤖
