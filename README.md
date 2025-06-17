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
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install & Run
```bash
# Install dependencies
npm install && cd client && npm install && cd ..

# Test OpenAI connection
npm run test-openai

# Start both server and client
npm run dev-all
```

### 3. Access
- **Frontend**: http://localhost:3000
- **GraphQL**: http://localhost:4000/graphql

## 🧪 Test Features

- ✅ AI chat responses (powered by **OpenAI ChatGPT**)
- ✅ Product search with real embeddings
- ✅ Real-time suggestions
- ✅ GraphQL integration

## 📁 Structure

```
├── src/                 # GraphQL server (with OpenAI)
├── client/             # React frontend  
├── .env               # Environment variables
└── package.json       # Server dependencies
```

## 🔧 Commands

```bash
npm run dev-all        # Start both server & client
npm run dev           # Server only
npm run client        # Client only
npm run test-openai   # Test OpenAI connection
npm run test-gemini   # Test Gemini connection (legacy)
npm run quick-test    # Test server setup
```

## 💡 Notes

- Testing project - not production ready
- Uses **OpenAI ChatGPT** for AI responses
- Uses **OpenAI text-embedding-ada-002** for product search
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

### Benefits of Vector Search

✅ **Semantic Understanding**: Finds products by meaning, not just words  
✅ **Better UX**: Users can ask naturally like "budget gaming setup"  
✅ **Multilingual**: Works across different languages  
✅ **Fuzzy Matching**: Handles typos and variations  
✅ **Context Aware**: Understands "laptop for gaming" vs "laptop for work"  

---
*Simple setup for testing GraphQL + OpenAI ChatGPT concepts* 🤖
