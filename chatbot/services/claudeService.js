const AirtableService = require('./airtableService');

class ClaudeService {
    constructor() {
        this.airtableService = new AirtableService();
        this.sessions = new Map(); // In production, use Redis
        this.systemPrompt = this.buildSystemPrompt();
    }

    buildSystemPrompt() {
        return `You are Helena, a highly knowledgeable customer service representative for Heritagebox, a professional media digitization company. You specialize in helping customers with their precious memories.

COMPANY EXPERTISE:
- Photo scanning (standard up to 4x6, large 8x10+)
- Slide and negative digitization
- Video tape transfer (VHS, 8mm, Hi8, Digital8, MiniDV)
- Film reel transfer (8mm, 16mm)
- Professional restoration and color correction
- Rush services available

PRICING KNOWLEDGE:
- Standard photos: $0.50 each
- Large photos (8x10+): $1.00 each  
- Slides/negatives: $0.75 each
- VHS/VHS-C transfer: $25 per tape
- 8mm/Hi8/Digital8: $30 per tape
- MiniDV: $20 per tape
- Film reels: $40-80 per reel
- Bulk discounts: 5% (50+ items), 10% (100+ items), 15% (500+ items)
- Rush service: +50% fee, 2-3 day turnaround

PERSONALITY & COMMUNICATION:
- Warm, professional, and empathetic - you understand these are precious memories
- Use emojis thoughtfully (📸 for photos, 🎬 for videos, 💝 for memories)
- Ask clarifying questions to provide accurate quotes
- Proactively suggest services based on customer needs
- Always mention our professional restoration and color correction
- Use HTML formatting: <br> for line breaks, <strong> for emphasis

BUSINESS INTELLIGENCE:
- Identify high-value leads (large projects, rush services, commercial clients)
- Capture contact information naturally during conversations
- Recognize when customers need human assistance for complex projects
- Flag technical questions that require specialist knowledge

RESPONSE STRUCTURE:
When providing quotes or detailed information, format responses with clear sections and use structured data when helpful. Always end with a helpful next step or question to keep the conversation flowing.

Remember: You have access to real customer data, order status, and current pricing. Use this information to provide personalized, accurate responses.`;
    }

    // Session Management
    getSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                messages: [],
                customerInfo: {},
                context: {},
                startTime: new Date(),
                lastActivity: new Date()
            });
        }
        return this.sessions.get(sessionId);
    }

    updateSession(sessionId, updates) {
        const session = this.getSession(sessionId);
        Object.assign(session, updates);
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
    }

    // Message Analysis and Intelligence
    async analyzeMessage(message, sessionId) {
        const analysis = {
            intent: 'general',
            entities: {},
            needsData: false,
            isHighValue: false,
            urgency: 'normal'
        };

        const lowerMessage = message.toLowerCase();

        // Intent Recognition
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
            analysis.intent = 'pricing';
            analysis.entities = this.extractPricingEntities(message);
        } else if (lowerMessage.includes('order') || lowerMessage.includes('status')) {
            analysis.intent = 'order_status';
            analysis.entities = this.extractOrderEntities(message);
            analysis.needsData = true;
        } else if (lowerMessage.includes('service') || lowerMessage.includes('do you') || lowerMessage.includes('can you')) {
            analysis.intent = 'service_inquiry';
        } else if (lowerMessage.includes('rush') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
            analysis.urgency = 'high';
        }

        // High-Value Lead Detection
        const highValueIndicators = [
            /\b(thousand|1000|2000|5000)\b/i,
            /\b(business|company|commercial)\b/i,
            /\b(rush|urgent|asap)\b/i,
            /\b(large|big|huge)\s+(project|collection)\b/i
        ];

        analysis.isHighValue = highValueIndicators.some(pattern => pattern.test(message));

        // Contact Information Extraction
        const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        const phoneMatch = message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
        
        if (emailMatch) analysis.entities.email = emailMatch[0];
        if (phoneMatch) analysis.entities.phone = phoneMatch[0];

        return analysis;
    }

    extractPricingEntities(message) {
        const entities = {};
        
        // Extract quantities
        const quantityMatch = message.match(/\b(\d+)\s*(photos?|pictures?|slides?|videos?|tapes?)\b/i);
        if (quantityMatch) {
            entities.quantity = parseInt(quantityMatch[1]);
            entities.mediaType = quantityMatch[2].toLowerCase();
        }

        // Extract media types
        const mediaTypes = {
            photo: /\b(photos?|pictures?|images?)\b/i,
            slide: /\b(slides?|negatives?)\b/i,
            video: /\b(videos?|tapes?|vhs|8mm|digital8|hi8|minidv)\b/i,
            film: /\b(film|reels?)\b/i
        };

        for (const [type, regex] of Object.entries(mediaTypes)) {
            if (regex.test(message)) {
                entities.detectedMediaType = type;
                break;
            }
        }

        return entities;
    }

    extractOrderEntities(message) {
        const entities = {};
        
        const orderMatch = message.match(/\b(order|#)\s*(\w+\d+|\d+)\b/i);
        if (orderMatch) entities.orderNumber = orderMatch[2];

        const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) entities.email = emailMatch[0];

        return entities;
    }

    // Enhanced Claude API Integration
    async processMessage(message, sessionId, context = {}) {
        try {
            const session = this.getSession(sessionId);
            const analysis = await this.analyzeMessage(message, sessionId);
            
            // Gather relevant business data if needed
            let businessContext = '';
            if (analysis.needsData) {
                businessContext = await this.gatherBusinessContext(analysis, session);
            }

            // Build conversation context
            const conversationHistory = session.messages.slice(-6); // Last 6 messages
            const contextPrompt = this.buildContextPrompt(conversationHistory, businessContext, analysis);

            // Call Claude API
            const response = await this.callClaudeAPI(message, contextPrompt);

            // Update session
            session.messages.push(
                { sender: 'user', content: message, timestamp: new Date(), analysis },
                { sender: 'assistant', content: response, timestamp: new Date() }
            );

            // Handle lead capture if applicable
            if (analysis.entities.email || analysis.entities.phone || analysis.isHighValue) {
                await this.handleLeadCapture(session, analysis);
            }

            this.updateSession(sessionId, session);

            return {
                response,
                analysis,
                structured: this.extractStructuredData(response, analysis)
            };

        } catch (error) {
            console.error('Claude processing error:', error);
            return {
                response: this.getErrorFallback(),
                analysis: { intent: 'error' },
                structured: null
            };
        }
    }

    async gatherBusinessContext(analysis, session) {
        let context = '';

        try {
            if (analysis.intent === 'order_status' && analysis.entities.orderNumber) {
                const orders = await this.airtableService.findOrdersByCustomer(
                    analysis.entities.email, 
                    analysis.entities.orderNumber, 
                    null
                );
                
                if (orders.found) {
                    const order = orders.orders[0];
                    context = `ORDER STATUS DATA: Order #${order.orderNumber} - Status: ${order.status}, Estimated Completion: ${order.estimatedCompletion}, Items: ${order.totalItems}, Service: ${order.serviceType}`;
                } else {
                    context = 'ORDER STATUS: No matching orders found with provided information.';
                }
            }

            if (analysis.intent === 'pricing' && analysis.entities.quantity) {
                const items = [{
                    type: analysis.entities.detectedMediaType || 'photo',
                    quantity: analysis.entities.quantity
                }];
                
                const quote = await this.airtableService.generateQuote(items);
                if (quote.success) {
                    context = `PRICING DATA: ${analysis.entities.quantity} ${analysis.entities.detectedMediaType}s = $${quote.quote.total.toFixed(2)}, Turnaround: ${quote.quote.estimatedTurnaround}`;
                }
            }
        } catch (error) {
            console.error('Business context error:', error);
        }

        return context;
    }

    buildContextPrompt(conversationHistory, businessContext, analysis) {
        let prompt = this.systemPrompt + '\n\n';

        if (businessContext) {
            prompt += `CURRENT BUSINESS DATA:\n${businessContext}\n\n`;
        }

        if (conversationHistory.length > 0) {
            prompt += 'CONVERSATION HISTORY:\n';
            conversationHistory.forEach(msg => {
                prompt += `${msg.sender.toUpperCase()}: ${msg.content}\n`;
            });
            prompt += '\n';
        }

        if (analysis.isHighValue) {
            prompt += 'NOTE: This appears to be a high-value lead. Provide extra attention and consider suggesting a personal consultation.\n\n';
        }

        return prompt;
    }

    async callClaudeAPI(message, contextPrompt) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1200,
                messages: [{
                    role: 'user',
                    content: `${contextPrompt}\n\nCUSTOMER MESSAGE: ${message}`
                }]
            })
        });

        const data = await response.json();
        return data.content[0].text;
    }

    async handleLeadCapture(session, analysis) {
        try {
            const customerInfo = {
                email: analysis.entities.email || session.customerInfo.email,
                phone: analysis.entities.phone || session.customerInfo.phone,
                name: session.customerInfo.name || 'Chat Lead'
            };

            const inquiryDetails = {
                summary: `${analysis.intent} inquiry`,
                transcript: session.messages.map(m => `${m.sender}: ${m.content}`).join('\n'),
                isHighValue: analysis.isHighValue
            };

            await this.airtableService.createLead(customerInfo, inquiryDetails);
            
            // Update session with captured info
            session.customerInfo = { ...session.customerInfo, ...customerInfo };
        } catch (error) {
            console.error('Lead capture error:', error);
        }
    }

    extractStructuredData(response, analysis) {
        // Extract structured data from Claude's response for frontend display
        if (analysis.intent === 'pricing' && response.includes('$')) {
            const priceMatch = response.match(/\$(\d+(?:\.\d{2})?)/);
            if (priceMatch) {
                return {
                    type: 'quote',
                    amount: parseFloat(priceMatch[1]),
                    formatted: priceMatch[0]
                };
            }
        }

        if (analysis.intent === 'order_status' && response.includes('Order')) {
            return {
                type: 'order_status',
                hasUpdate: true
            };
        }

        return null;
    }

    getErrorFallback() {
        return `I apologize, but I'm experiencing some technical difficulties right now. 😔<br><br>

For immediate assistance, please:<br>
📞 Call us at (555) 123-4567<br>
📧 Email support@heritagebox.com<br><br>

Our team is standing by to help with your precious memories! I'll be back online shortly.`;
    }

    // Session cleanup (call periodically)
    cleanupSessions() {
        const maxAge = 30 * 60 * 1000; // 30 minutes
        const now = new Date();
        
        for (const [sessionId, session] of this.sessions) {
            if (now - session.lastActivity > maxAge) {
                this.sessions.delete(sessionId);
            }
        }
    }
}

module.exports = ClaudeService;
