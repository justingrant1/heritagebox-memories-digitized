const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const Airtable = require('airtable');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Claude AI
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
});

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appFMHAYZrTskpmdX';

// Table IDs
const TABLES = {
  CUSTOMERS: 'tblUS7uf11axEmL56',
  PRODUCTS: 'tblJ0hgzvDXWgQGmK',
  ORDERS: 'tblTq25QawVDHTTkV',
  ORDER_ITEMS: 'tblgV4XGeQE3VL9CW'
};

// Initialize Airtable
let base = null;
if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
  try {
    base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    console.log('✅ AIRTABLE - Connected successfully');
  } catch (error) {
    console.warn('⚠️ AIRTABLE WARNING - Failed to initialize:', error);
  }
} else {
  console.warn('⚠️ AIRTABLE WARNING - Missing API key or Base ID. Chatbot will use fallback pricing.');
}

// Simple in-memory session storage
const sessions = new Map();

// Cache for product data (refreshed every 5 minutes)
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to fetch products from Airtable
const fetchProducts = async () => {
  if (!base) {
    console.warn('⚠️ AIRTABLE - Cannot fetch products, using fallback data');
    return null;
  }

  try {
    console.log('📊 AIRTABLE - Fetching current product data...');
    const records = await base(TABLES.PRODUCTS).select({
      sort: [{ field: 'Price', direction: 'asc' }]
    }).all();

    const products = records.map(record => ({
      id: record.id,
      name: record.get('Product Name') || 'Unknown Product',
      description: record.get('Description') || '',
      price: record.get('Price') || 0,
      sku: record.get('SKU') || '',
      stockQuantity: record.get('Stock Quantity') || 0,
      category: record.get('Category') || 'General',
      features: record.get('Features') || ''
    }));

    console.log(`✅ AIRTABLE - Fetched ${products.length} products successfully`);
    return products;
  } catch (error) {
    console.error('❌ AIRTABLE ERROR - Failed to fetch products:', error);
    return null;
  }
};

// Function to get cached or fresh product data
const getProducts = async () => {
  const now = Date.now();
  
  // Check if we have fresh cached data
  if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📊 AIRTABLE - Using cached product data');
    return productsCache;
  }

  // Fetch fresh data
  const freshProducts = await fetchProducts();
  if (freshProducts) {
    productsCache = freshProducts;
    cacheTimestamp = now;
    console.log('📊 AIRTABLE - Product cache updated');
    return freshProducts;
  }

  // Return cached data if available, even if stale
  if (productsCache) {
    console.log('⚠️ AIRTABLE - Using stale cached data');
    return productsCache;
  }

  return null;
};

// Function to generate dynamic system prompt with current pricing
const generateSystemPrompt = async () => {
  const products = await getProducts();
  
  let pricingInfo = '';
  if (products && products.length > 0) {
    // Organize products by category for better presentation
    const packages = products.filter(p => p.category === 'Package' || p.name.includes('Package') || 
      p.name.includes('Starter') || p.name.includes('Popular') || p.name.includes('Dusty Rose') || p.name.includes('Eternal'));
    
    const addOns = products.filter(p => p.category === 'Add-on' || p.name.includes('Add-on'));
    const services = products.filter(p => p.category === 'Service' || p.name.includes('Speed'));

    if (packages.length > 0) {
      pricingInfo += '\n📦 CURRENT DIGITIZATION PACKAGES:\n';
      packages.forEach(product => {
        pricingInfo += `- ${product.name}: $${product.price}`;
        if (product.features) {
          pricingInfo += ` (${product.features})`;
        }
        if (product.description && product.description !== product.name) {
          pricingInfo += ` - ${product.description}`;
        }
        pricingInfo += '\n';
      });
    }

    if (addOns.length > 0) {
      pricingInfo += '\n🔧 ADD-ON SERVICES:\n';
      addOns.forEach(product => {
        pricingInfo += `- ${product.name}: $${product.price}`;
        if (product.description) {
          pricingInfo += ` - ${product.description}`;
        }
        pricingInfo += '\n';
      });
    }

    if (services.length > 0) {
      pricingInfo += '\n⚡ SPEED OPTIONS:\n';
      services.forEach(product => {
        pricingInfo += `- ${product.name}: $${product.price}`;
        if (product.description) {
          pricingInfo += ` - ${product.description}`;
        }
        pricingInfo += '\n';
      });
    }

    // Add any remaining products
    const otherProducts = products.filter(p => 
      !packages.includes(p) && !addOns.includes(p) && !services.includes(p));
    if (otherProducts.length > 0) {
      pricingInfo += '\n📋 OTHER SERVICES:\n';
      otherProducts.forEach(product => {
        pricingInfo += `- ${product.name}: $${product.price}`;
        if (product.description) {
          pricingInfo += ` - ${product.description}`;
        }
        pricingInfo += '\n';
      });
    }

    pricingInfo += '\n💡 NOTE: All pricing is current as of today. Packages may include multiple services and bulk discounts.\n';
  } else {
    // Fallback pricing if Airtable is unavailable
    pricingInfo = `
📦 FALLBACK PRICING (Airtable unavailable):
- Standard photos: $0.50 each
- Large photos (8x10+): $1.00 each
- Slides/negatives: $0.75 each
- VHS/VHS-C: $25 per tape
- 8mm/Hi8/Digital8: $30 per tape
- MiniDV: $20 per tape
- Film reels (8mm/16mm): $40-80 per reel

⚠️ Note: Please check our website for most current pricing.
`;
  }

  return `You are a helpful AI assistant for Heritagebox, a professional media digitization company. You help customers with:

- Photo digitization pricing and services
- Video transfer options and pricing  
- Order status inquiries
- Turnaround times and scheduling
- General questions about digitization services

${pricingInfo}

Current turnaround times:
- Standard processing: 2-3 weeks
- Express processing: 1 week (+$50)
- Rush processing: 3-5 days (+$100)
- Large projects may take longer

IMPORTANT INSTRUCTIONS:
- Always use the current pricing information provided above
- When customers ask about packages, explain our main offerings: Starter, Popular, Dusty Rose, and Eternal packages
- Mention that we offer various add-ons like USB drives, online galleries, photo restoration, etc.
- For specific order status, ask for order number, email, or customer details
- Be helpful, professional, and encourage customers to visit our website for full package details

If pricing information seems unavailable, direct customers to check our website or contact us directly for the most current rates.`;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message and sessionId are required' 
      });
    }

    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }

    const sessionMessages = sessions.get(sessionId);
    
    // Add user message to session
    sessionMessages.push({ role: 'user', content: message });

    // Prepare messages for Claude (keep last 10 messages to avoid token limits)
    const recentMessages = sessionMessages.slice(-10);

    console.log(`Processing message for session ${sessionId}: ${message.substring(0, 100)}...`);

    // Generate dynamic system prompt with current Airtable data
    const systemPrompt = await generateSystemPrompt();

    // Call Claude AI
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: recentMessages
    });

    const assistantMessage = response.content[0].text;

    // Add assistant response to session
    sessionMessages.push({ role: 'assistant', content: assistantMessage });

    console.log(`Response generated for session ${sessionId}: ${assistantMessage.substring(0, 100)}...`);

    res.json({ 
      success: true, 
      response: assistantMessage,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    let errorMessage = 'I apologize, but I\'m having technical difficulties right now.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Configuration issue with AI service. Please contact support.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Service is temporarily busy. Please try again in a moment.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Heritagebox Chat Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Clear session endpoint (for testing)
app.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ success: true, message: 'Session cleared' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Heritagebox Chat Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
});

module.exports = app;
