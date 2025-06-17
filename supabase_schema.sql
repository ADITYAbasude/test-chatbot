-- Enable pgvector extension for vector similarity search
create extension if not exists vector;

-- Products table with vector embeddings
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2),
  category text,
  embedding vector(3072), -- Azure OpenAI text-embedding-3-large dimension
  popularity integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User preferences table
create table user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  preferences jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations table for chat history (matches your current structure)
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  user_message text not null,
  ai_response text not null,
  products_mentioned uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to search products using vector similarity
create or replace function search_products(
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns setof products
language sql stable
as $$
  select *
  from products
  where embedding <#> query_embedding < -match_threshold
  order by embedding <#> query_embedding
  limit match_count;
$$;

-- Function to get recommendations based on user preferences
create or replace function get_recommendations(
  user_preferences jsonb,
  match_count int
)
returns setof products
language sql stable
as $$
  select *
  from products
  where category = any(array(select jsonb_array_elements_text(user_preferences->'categories')))
     or name ilike any(array(select '%' || jsonb_array_elements_text(user_preferences->'keywords') || '%'))
  order by popularity desc, created_at desc
  limit match_count;
$$;

-- Insert sample products
insert into products (name, description, price, category, popularity) values
  ('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip and titanium design', 999.00, 'Electronics', 95),
  ('MacBook Air M2', 'Lightweight laptop with M2 chip and 13-inch display', 1199.00, 'Electronics', 88),
  ('AirPods Pro 2nd Gen', 'Active noise cancelling wireless earbuds', 249.00, 'Electronics', 92),
  ('Nike Air Jordan 1', 'Classic basketball shoes in various colorways', 170.00, 'Footwear', 87),
  ('Levi''s 501 Jeans', 'Original straight fit jeans in classic blue', 89.00, 'Clothing', 79),
  ('Samsung 65" QLED TV', '4K Smart TV with quantum dot technology', 1299.00, 'Electronics', 84),
  ('Instant Pot Duo 7-in-1', 'Multi-use pressure cooker for quick meals', 99.00, 'Kitchen', 91),
  ('Dyson V15 Detect', 'Cordless vacuum with laser dust detection', 749.00, 'Home', 86),
  ('Nintendo Switch OLED', 'Gaming console with vibrant OLED screen', 349.00, 'Gaming', 89),
  ('Kindle Paperwhite', 'Waterproof e-reader with adjustable warm light', 139.00, 'Books', 83);

-- Indexes for better performance
create index on products using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on products (category);
create index on products (popularity desc);
create index on conversations (user_id);
create index on conversations (created_at desc);

-- Row Level Security (RLS) policies
alter table products enable row level security;
alter table user_preferences enable row level security;
alter table conversations enable row level security;

-- Allow public read access to products
create policy "Products are publicly readable" on products
  for select using (true);

-- Allow users to manage their own preferences
create policy "Users can manage their own preferences" on user_preferences
  for all using (auth.uid()::text = user_id);

-- Allow users to manage their own conversations
create policy "Users can manage their own conversations" on conversations
  for all using (auth.uid()::text = user_id);

-- Function to update product embeddings (call this after inserting products)
create or replace function update_product_embeddings()
returns void
language plpgsql
as $$
begin
  -- This would typically be called from your application
  -- after generating embeddings with OpenAI
  raise notice 'Update embeddings by calling OpenAI API from your application';
end;
$$;
