const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Claude AI API function
async function callClaudeAPI(message, context = '') {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `You are a helpful customer service assistant for Heritagebox, a professional media digitization service. 

COMPANY INFORMATION:
- Heritagebox specializes in digitizing photos, videos, slides, negatives, and film reels
- We offer professional scanning and transfer services
- Current pricing: Photos $0.50 each, Large photos $1.00, Slides/negatives $0.75, Videos $20-30 per tape
- Turnaround times: Photos 5-7 days, Videos 10-14 days, Large projects 3-4 weeks
- We offer rush services for +50% fee (2-3 days)
- All work includes professional color correction and digital cleanup

AIRTABLE CONTEXT:
${context}

Please respond to this customer inquiry in a helpful, professional manner. Use emojis and HTML formatting (like <br> for line breaks and <strong> for emphasis) to make responses visually appealing. Keep responses concise but informative.

Customer message: ${message}`
                }]
            })
        });

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('Claude API Error:', error);
        throw error;
    }
}

// Airtable API function
async function getAirtableData(query) {
    try {
        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiKey = process.env.AIRTABLE_API_KEY;
        
        // Example: Get customer orders or pricing data
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Orders?maxRecords=10&filterByFormula={Status}='Active'`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error('Airtable API Error:', error);
        return [];
    }
}

// Search for customer orders
async function searchCustomerOrder(email, orderNumber, lastName) {
    try {
        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiKey = process.env.AIRTABLE_API_KEY;
        
        let filterFormula = '';
        if (email) {
            filterFormula = `{Customer Email}='${email}'`;
        } else if (orderNumber) {
            filterFormula = `{Order Number}='${orderNumber}'`;
        } else if (lastName) {
            filterFormula = `SEARCH('${lastName}', {Customer Name}) > 0`;
        }
        
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Orders?filterByFormula=${encodeURIComponent(filterFormula)}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error('Customer search error:', error);
        return [];
    }
}

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Check if message is asking for order status
        let airtableContext = '';
        if (message.toLowerCase().includes('order') || message.toLowerCase().includes('status')) {
            // Extract potential identifiers from message
            const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            const orderMatch = message.match(/\b\d{4,}\b/);
            
            if (emailMatch || orderMatch) {
                const orders = await searchCustomerOrder(emailMatch?.[0], orderMatch?.[0], null);
                if (orders.length > 0) {
                    airtableContext = `CUSTOMER ORDER DATA: Found ${orders.length} order(s). Latest order status: ${orders[0].fields.Status}, estimated completion: ${orders[0].fields['Estimated Completion']}, items: ${orders[0].fields['Item Count']}`;
                }
            }
        }
        
        // Get pricing data for quotes
        if (message.toLowerCase().includes('price') || message.toLowerCase().includes('quote')) {
            const pricingData = await getAirtableData('pricing');
            if (pricingData.length > 0) {
                airtableContext += ' CURRENT PRICING: Based on live data from our system.';
            }
        }
        
        // Call Claude API with context
        const response = await callClaudeAPI(message, airtableContext);
        
        res.json({ response });
        
    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Fallback response
        res.json({ 
            response: `I apologize, but I'm experiencing some technical difficulties right now. For immediate assistance, please call us at (555) 123-4567 or email support@heritagebox.com. I'll be back online shortly!` 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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
