import { supabase, azureOpenAI } from './src/utils/context.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample products to populate the database
const sampleProducts = [  {
    name: "Gaming Laptop Pro",
    description: "High-performance gaming laptop with RTX 4070, 16GB RAM, and 144Hz display. Perfect for gaming and content creation.",
    price: 1299.99,
    category: "Electronics",
    popularity: 85
  },
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality.",
    price: 199.99,
    category: "Electronics",
    popularity: 92
  },
  {
    name: "Smartphone Pro Max",
    description: "Latest flagship smartphone with advanced camera system, 5G connectivity, and all-day battery life.",
    price: 999.99,
    category: "Electronics",
    popularity: 88
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with custom switches, perfect for gaming and productivity.",
    price: 149.99,
    category: "Electronics",
    popularity: 76
  },
  {
    name: "4K Webcam",
    description: "Ultra HD webcam with auto-focus and noise reduction, ideal for streaming and video calls.",
    price: 89.99,
    category: "Electronics",
    popularity: 71
  },
  {
    name: "Running Shoes",
    description: "Lightweight athletic running shoes with advanced cushioning and breathable mesh design.",
    price: 129.99,
    category: "Sports",
    popularity: 82
  },
  {
    name: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with built-in grinder and thermal carafe for perfect coffee every time.",
    price: 179.99,
    category: "Home",
    popularity: 79
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking and long-lasting battery for productivity.",
    price: 49.99,
    category: "Electronics",
    popularity: 84
  },
  {
    name: "Fitness Tracker",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking capabilities.",
    price: 199.99,
    category: "Health",
    popularity: 89
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof Bluetooth speaker with 360-degree sound and 12-hour battery life.",
    price: 79.99,
    category: "Electronics",
    popularity: 87
  },
  {
    name: "Office Chair Ergonomic",
    description: "Comfortable ergonomic office chair with lumbar support and adjustable height for all-day comfort.",
    price: 249.99,
    category: "Furniture",
    popularity: 78
  },
  {
    name: "Tablet Pro",
    description: "High-performance tablet with stylus support, perfect for drawing, note-taking, and productivity.",
    price: 599.99,
    category: "Electronics",
    popularity: 83
  },
  // NEW PRODUCTS - Electronics & Gaming
  {
    name: "Gaming Monitor 27-inch",
    description: "4K HDR gaming monitor with 144Hz refresh rate, G-Sync support, and ultra-low input lag for competitive gaming.",
    price: 449.99,
    category: "Electronics",
    popularity: 86
  },
  {
    name: "Wireless Gaming Headset",
    description: "7.1 surround sound wireless gaming headset with noise-canceling microphone and RGB lighting.",
    price: 159.99,
    category: "Electronics",
    popularity: 81
  },
  {
    name: "Mechanical Keyboard Compact",
    description: "60% compact mechanical keyboard with hot-swappable switches, wireless connectivity, and programmable macros.",
    price: 129.99,
    category: "Electronics",
    popularity: 75
  },
  {
    name: "Gaming Mouse Pad XXL",
    description: "Extra large gaming mouse pad with RGB lighting, non-slip base, and smooth surface for precision tracking.",
    price: 39.99,
    category: "Electronics",
    popularity: 72
  },
  {
    name: "USB-C Docking Station",
    description: "Multi-port USB-C hub with 4K HDMI, USB 3.0, Ethernet, and 100W power delivery for laptops.",
    price: 89.99,
    category: "Electronics",
    popularity: 79
  },
  {
    name: "Portable SSD 1TB",
    description: "Ultra-fast portable SSD with USB-C connectivity, 1050MB/s read speeds, and compact aluminum design.",
    price: 119.99,
    category: "Electronics",
    popularity: 85
  },
  {
    name: "Wireless Charging Stand",
    description: "Fast wireless charging stand with adjustable angle, LED indicator, and universal compatibility.",
    price: 29.99,
    category: "Electronics",
    popularity: 74
  },
  // Home & Kitchen
  {
    name: "Smart Home Assistant",
    description: "Voice-controlled smart speaker with AI assistant, smart home integration, and premium sound quality.",
    price: 99.99,
    category: "Home",
    popularity: 88
  },
  {
    name: "Air Fryer Digital",
    description: "7-quart digital air fryer with touchscreen controls, 8 preset cooking modes, and dishwasher-safe basket.",
    price: 139.99,
    category: "Home",
    popularity: 91
  },
  {
    name: "Robot Vacuum Cleaner",
    description: "Smart robot vacuum with mapping technology, app control, and automatic dirt disposal for hands-free cleaning.",
    price: 299.99,
    category: "Home",
    popularity: 84
  },
  {
    name: "Espresso Machine",
    description: "Semi-automatic espresso machine with built-in grinder, milk frother, and programmable brewing settings.",
    price: 249.99,
    category: "Home",
    popularity: 77
  },
  {
    name: "Smart Thermostat",
    description: "WiFi-enabled smart thermostat with learning algorithms, energy saving features, and smartphone app control.",
    price: 199.99,
    category: "Home",
    popularity: 82
  },
  // Fashion & Clothing
  {
    name: "Casual Sneakers",
    description: "Comfortable everyday sneakers with memory foam insole, breathable mesh upper, and stylish design.",
    price: 79.99,
    category: "Fashion",
    popularity: 86
  },
  {
    name: "Denim Jacket Classic",
    description: "Vintage-style denim jacket with classic fit, quality cotton construction, and versatile styling options.",
    price: 59.99,
    category: "Fashion",
    popularity: 73
  },
  {
    name: "Backpack Travel",
    description: "Durable travel backpack with laptop compartment, USB charging port, and water-resistant materials.",
    price: 89.99,
    category: "Fashion",
    popularity: 81
  },
  {
    name: "Sunglasses Polarized",
    description: "Premium polarized sunglasses with UV400 protection, lightweight titanium frame, and anti-glare coating.",
    price: 129.99,
    category: "Fashion",
    popularity: 75
  },
  {
    name: "Winter Coat Insulated",
    description: "Warm insulated winter coat with water-resistant exterior, down filling, and removable hood.",
    price: 199.99,
    category: "Fashion",
    popularity: 78
  },
  // Sports & Fitness
  {
    name: "Yoga Mat Premium",
    description: "Non-slip premium yoga mat with extra cushioning, eco-friendly materials, and carrying strap included.",
    price: 49.99,
    category: "Sports",
    popularity: 83
  },
  {
    name: "Dumbbells Adjustable",
    description: "Space-saving adjustable dumbbells with weight range 5-50lbs per dumbbell, quick-change system.",
    price: 299.99,
    category: "Sports",
    popularity: 87
  },
  {
    name: "Resistance Bands Set",
    description: "Complete resistance bands set with different resistance levels, door anchor, and exercise guide.",
    price: 24.99,
    category: "Sports",
    popularity: 85
  },
  {
    name: "Protein Shaker Bottle",
    description: "Leak-proof protein shaker with mixing ball, measurement markings, and BPA-free construction.",
    price: 12.99,
    category: "Sports",
    popularity: 74
  },
  {
    name: "Cycling Helmet",
    description: "Lightweight cycling helmet with MIPS protection, adjustable fit system, and ventilation channels.",
    price: 69.99,
    category: "Sports",
    popularity: 79
  },
  // Health & Beauty
  {
    name: "Electric Toothbrush",
    description: "Rechargeable electric toothbrush with multiple cleaning modes, pressure sensor, and UV sanitizer.",
    price: 89.99,
    category: "Health",
    popularity: 88
  },
  {
    name: "Massage Gun Percussive",
    description: "Deep tissue massage gun with multiple attachments, adjustable speeds, and long battery life.",
    price: 149.99,
    category: "Health",
    popularity: 82
  },
  {
    name: "Skincare Set Organic",
    description: "Complete organic skincare set with cleanser, toner, serum, and moisturizer for all skin types.",
    price: 79.99,
    category: "Health",
    popularity: 76
  },
  {
    name: "Essential Oils Diffuser",
    description: "Ultrasonic aromatherapy diffuser with LED lighting, timer settings, and whisper-quiet operation.",
    price: 39.99,
    category: "Health",
    popularity: 81
  },
  // Furniture & Decor
  {
    name: "Standing Desk Adjustable",
    description: "Height-adjustable standing desk with memory presets, anti-collision system, and cable management.",
    price: 399.99,
    category: "Furniture",
    popularity: 84
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls, USB charging port, and eye-care lighting technology.",
    price: 59.99,
    category: "Furniture",
    popularity: 77
  },
  {
    name: "Storage Ottoman",
    description: "Multi-functional storage ottoman with hidden compartment, comfortable seating, and modern design.",
    price: 79.99,
    category: "Furniture",
    popularity: 73
  },
  {
    name: "Wall Art Canvas Set",
    description: "Modern abstract canvas wall art set of 3 pieces with gallery-wrapped frames and fade-resistant prints.",
    price: 89.99,
    category: "Furniture",
    popularity: 71
  },
  // Books & Media
  {
    name: "E-Reader Waterproof",
    description: "Waterproof e-reader with 6.8-inch display, adjustable warm light, and weeks of battery life.",
    price: 139.99,
    category: "Books",
    popularity: 85
  },
  {
    name: "Cookbook Collection",
    description: "Complete cookbook collection featuring international cuisines, healthy recipes, and cooking techniques.",
    price: 49.99,
    category: "Books",
    popularity: 78
  },
  {
    name: "Board Game Strategy",
    description: "Award-winning strategy board game for 2-4 players with engaging gameplay and high replay value.",
    price: 59.99,
    category: "Games",
    popularity: 82
  },
  // Automotive
  {
    name: "Car Phone Mount",
    description: "Magnetic car phone mount with 360-degree rotation, strong magnet, and dashboard/windshield attachment.",
    price: 19.99,
    category: "Automotive",
    popularity: 83
  },
  {
    name: "Car Dash Camera",
    description: "4K dash camera with night vision, GPS tracking, parking mode, and collision detection.",
    price: 129.99,
    category: "Automotive",
    popularity: 79
  },
  {
    name: "Tire Pressure Gauge",
    description: "Digital tire pressure gauge with backlit display, high accuracy, and compact design for easy storage.",
    price: 24.99,
    category: "Automotive",
    popularity: 71
  }
];

async function generateEmbedding(text) {
  try {
    const response = await azureOpenAI.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-large", // 3072 dimensions
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function populateProducts() {
  console.log('🚀 Starting to populate Supabase with products and embeddings...\n');
  
  try {
    // First, check if products table exists and is empty
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking products table:', checkError);
      console.log('💡 Make sure you have run the SQL schema in your Supabase SQL editor first!');
      return;
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('⚠️  Products table already has data. Do you want to continue adding more products?');
      console.log('   If you want to start fresh, truncate the products table in Supabase first.\n');
    }
    
    console.log(`📦 Processing ${sampleProducts.length} products...\n`);
    
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      console.log(`${i + 1}/${sampleProducts.length} Processing: ${product.name}`);
      
      try {
        // Generate embedding for product name + description
        const embeddingText = `${product.name} ${product.description}`;
        console.log(`   📝 Generating embedding for: "${embeddingText.slice(0, 50)}..."`);
        
        const embedding = await generateEmbedding(embeddingText);
        console.log(`   ✅ Generated embedding (${embedding.length} dimensions)`);
        
        // Insert product with embedding into Supabase
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            popularity: product.popularity,
            embedding: embedding
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`   ❌ Error inserting ${product.name}:`, error);
        } else {
          console.log(`   ✅ Inserted with ID: ${data.id}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${product.name}:`, error.message);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Verify the results
    const { data: finalProducts, error: countError } = await supabase
      .from('products')
      .select('id, name, category')
      .order('created_at', { ascending: false });
    
    if (countError) {
      console.error('❌ Error counting products:', countError);
    } else {
      console.log('🎉 Products successfully populated!');
      console.log(`📊 Total products in database: ${finalProducts.length}`);
      console.log('\n📋 Recent products:');
      finalProducts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.category})`);
      });
    }
    
    console.log('\n✅ Database population complete!');
    console.log('🚀 You can now test vector search with: npm run test-system');
    
  } catch (error) {
    console.error('❌ Failed to populate products:', error);
  }
}

// Run the population script
populateProducts();
