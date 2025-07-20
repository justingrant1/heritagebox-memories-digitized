const express = require('express');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import our enhanced services
const ClaudeService = require('./services/claudeService');
const AirtableService = require('./services/airtableService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const claudeService = new ClaudeService();
const airtableService = new AirtableService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Enhanced chat endpoint with session management
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = uuidv4() } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Process message through enhanced Claude service
        const result = await claudeService.processMessage(message, sessionId);
        
        // Log conversation for business intelligence
        await airtableService.logConversation(sessionId, [
            { sender: 'user', content: message, timestamp: new Date() },
            { sender: 'assistant', content: result.response, timestamp: new Date() }
        ]);

        res.json({ 
            response: result.response,
            sessionId: sessionId,
            analysis: result.analysis,
            structured: result.structured
        });
        
    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Enhanced fallback response
        res.json({ 
            response: claudeService.getErrorFallback(),
            sessionId: req.body.sessionId || uuidv4(),
            analysis: { intent: 'error' },
            structured: null
        });
    }
});

// New endpoint: Generate detailed quotes
app.post('/api/quotes/generate', async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Items array is required' });
        }

        const quote = await airtableService.generateQuote(items);
        
        if (quote.success) {
            res.json(quote.quote);
        } else {
            res.status(500).json({ error: quote.error });
        }
        
    } catch (error) {
        console.error('Quote generation error:', error);
        res.status(500).json({ error: 'Failed to generate quote' });
    }
});

// New endpoint: Order status lookup
app.get('/api/orders/status/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        const { type = 'order' } = req.query; // 'order', 'email', 'name'
        
        let orders;
        switch (type) {
            case 'email':
                orders = await airtableService.findOrdersByCustomer(identifier, null, null);
                break;
            case 'name':
                orders = await airtableService.findOrdersByCustomer(null, null, identifier);
                break;
            default:
                orders = await airtableService.findOrdersByCustomer(null, identifier, null);
        }
        
        if (orders.found) {
            res.json({ success: true, orders: orders.orders });
        } else {
            res.json({ success: false, message: 'No orders found' });
        }
        
    } catch (error) {
        console.error('Order lookup error:', error);
        res.status(500).json({ error: 'Failed to lookup orders' });
    }
});

// New endpoint: Service catalog
app.get('/api/services', async (req, res) => {
    try {
        const catalog = await airtableService.getProductCatalog();
        
        if (catalog.success) {
            res.json(catalog.products);
        } else {
            res.status(500).json({ error: catalog.error });
        }
        
    } catch (error) {
        console.error('Service catalog error:', error);
        res.status(500).json({ error: 'Failed to load services' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Human handoff endpoint
app.post('/api/request-human', async (req, res) => {
    try {
        const { messages } = req.body;
        const sessionId = uuidv4();
        
        const transcript = messages.map(msg => `[${msg.sender.toUpperCase()}] ${msg.content}`).join('\n\n');

        // 1. Log to Airtable using MCP
        /*
        const airtableResult = await use_mcp_tool('github.com/domdomegg/airtable-mcp-server', 'create_record', {
            baseId: 'appFMHAYZrTskpmdX',
            tableId: 'tbl6gHHlvSwx4gQpB',
            fields: {
                'SessionID': sessionId,
                'Transcript': transcript,
                'Status': 'Needs Human'
            }
        });
        const recordId = airtableResult.id;
        */

        // For now, let's simulate the recordId
        const recordId = "simulated_record_id";

        // 2. Notify Slack using MCP
        const slackMessage = `*New Human Support Request* :wave:\n\n*Session ID:* ${sessionId}\n\n*Transcript:*\n\`\`\`${transcript}\`\`\`\n\n<https://airtable.com/appFMHAYZrTskpmdX/tbl6gHHlvSwx4gQpB/${recordId}|View in Airtable>`;
        
        /*
        await use_mcp_tool('github.com/korotovsky/slack-mcp-server', 'conversations_add_message', {
            channel_id: '#vip-sales',
            payload: slackMessage,
            content_type: 'text/markdown'
        });
        */
       
        // Simulate Slack notification
        console.log("Simulating Slack notification:", slackMessage);

        res.status(200).json({ success: true, message: 'Handoff request received.' });

    } catch (error) {
        console.error('Handoff API Error:', error);
        res.status(500).json({ success: false, error: 'Failed to process handoff request.' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🎞️ Heritagebox Chatbot Server running on port ${PORT}`);
    console.log(`📱 Visit http://localhost:${PORT} to test the chatbot`);
});

module.exports = app;
