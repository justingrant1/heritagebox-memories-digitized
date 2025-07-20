export const config = {
    runtime: 'edge',
};

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  conversationHistory?: ChatMessage[];
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

// Claude AI integration
async function callClaudeAPI(messages: ClaudeMessage[]) {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    logEvent('claude_api_key_missing', { message: 'Claude API key not configured' });
    throw new Error('Claude API key not configured');
  }

  logEvent('claude_api_request', { 
    messageCount: messages.length,
    apiKeyPresent: !!CLAUDE_API_KEY,
    apiKeyLength: CLAUDE_API_KEY.length
  });

  try {
    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `You are Helena, the helpful AI assistant for Heritagebox - a professional media digitization service. 

You help customers with:
- Pricing quotes for photo scanning, video transfer, film digitization
- Project status updates and order tracking  
- Service information and turnaround times
- Technical questions about digitization processes

Be friendly, professional, and knowledgeable. Always try to provide specific, helpful information.

Current Services & Pricing:
- Photos: $0.50 each (standard), $1.00 (large 8x10+)
- Slides/Negatives: $0.75 each
- VHS tapes: $25 each
- 8mm/Hi8 tapes: $30 each
- MiniDV: $20 each
- Film reels: $40-80 each
- Bulk discounts available for 500+ items

Turnaround times:
- Photos: 5-7 business days
- Videos: 10-14 business days
- Large projects: 3-4 weeks
- Rush service: +50% fee, 2-3 days`,
      messages: messages
    };

    logEvent('claude_request_body', { 
      model: requestBody.model, 
      systemLength: requestBody.system.length,
      messageCount: requestBody.messages.length 
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    logEvent('claude_response_received', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      logEvent('claude_api_error', { 
        status: response.status, 
        statusText: response.statusText,
        errorBody: errorText.substring(0, 500)
      });
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    logEvent('claude_response_parsed', { 
      hasContent: !!result.content,
      contentLength: result.content?.[0]?.text?.length || 0
    });

    if (!result.content || !result.content[0] || !result.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    return result.content[0].text;
  } catch (error) {
    logEvent('claude_api_exception', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

// Airtable integration for order status and customer data
async function checkOrderStatus(query: string) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  
  if (!AIRTABLE_API_KEY || !BASE_ID) {
    return null;
  }

  try {
    // This would search for orders in Airtable
    // For now, return a sample response
    return {
      found: false,
      message: "I can check your order status! Please provide your order number or the email address you used when placing your order."
    };
  } catch (error) {
    console.error('Airtable Error:', error);
    return null;
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('scan')) {
    return `📸 **Photo Digitization Pricing:**

• Standard photos: $0.50 each
• Large photos (8x10+): $1.00 each  
• Slides/negatives: $0.75 each
• Bulk discounts available for 500+ items

All photos are scanned at 600 DPI with color correction included. Would you like me to create a custom quote for your collection?`;
  }
  
  if (lowerMessage.includes('video') || lowerMessage.includes('tape') || lowerMessage.includes('film')) {
    return `🎬 **Video Transfer Options:**

• VHS/VHS-C: $25 per tape
• 8mm/Hi8/Digital8: $30 per tape
• MiniDV: $20 per tape  
• Film reels (8mm/16mm): $40-80 per reel

Includes digital cleanup and DVD/digital file delivery. What type of tapes do you have?`;
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('project')) {
    return `📦 I can check your order status! I'll need either:

• Your order number
• Email address used for the order
• Last name + phone number

Once you provide this information, I'll instantly access your project details from our system and provide live updates, estimated completion dates, and tracking information.`;
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('turnaround')) {
    return `⏱️ **Current Turnaround Times:**

• Photos: 5-7 business days
• Videos: 10-14 business days  
• Large projects (1000+ items): 3-4 weeks
• Rush service: +50% fee, 2-3 days

These are live estimates based on our current queue. Would you like rush processing?`;
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
    return `💰 I can provide instant pricing! Tell me more about your project:

• What type of media? (photos, videos, slides, etc.)
• Approximately how many items?
• Any special requirements?

I'll calculate a custom quote with our current pricing and any applicable discounts.`;
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm Helena, your Heritagebox AI assistant. Great to meet you! 👋

I'm here to help with all your media digitization needs:

📸 Photo & slide scanning
🎬 Video & film transfer  
💰 Pricing & quotes
📦 Order status & tracking
⏱️ Turnaround times

What can I help you with today?`;
  }
  
  // Default response
  return `Thanks for your message! I'm Helena, your Heritagebox AI assistant. I can help with:

📸 Photo & slide scanning pricing
🎬 Video & film transfer options  
💰 Custom quotes and pricing
📦 Order status tracking
⏱️ Turnaround times & rush service

What would you like to know about our digitization services?`;
}

function formatResponseAsHTML(text: string): string {
  // Convert markdown-like formatting to HTML for better display
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/###\s+(.*?)$/gm, '<h3>$1</h3>')
    .replace(/##\s+(.*?)$/gm, '<h2>$1</h2>')
    .replace(/•\s/g, '• ')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

export default async function handler(request: Request) {
    logEvent('chat_request_received', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries())
    });

    if (request.method !== 'POST') {
        logEvent('method_not_allowed', {method: request.method});
        return new Response(JSON.stringify({success: false, error: 'Method not allowed'}), {
            status: 405,
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        const body = await request.json();
        logEvent('chat_request_body_parsed', {
            hasMessage: !!body.message,
            hasSessionId: !!body.sessionId,
            historyLength: body.conversationHistory?.length || 0
        });

        const { message, sessionId, conversationHistory }: ChatRequest = body;

        if (!message || message.trim().length === 0) {
            logEvent('validation_failed', { missingMessage: !message });
            return new Response(JSON.stringify({success: false, error: 'Message is required'}), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        // Check if this is an order status query
        const orderInfo = await checkOrderStatus(message);

        // Prepare conversation context for Claude
        const messages: ClaudeMessage[] = [];
        
        // Add conversation history if available
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.slice(-6).forEach(msg => {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        // Get response from Claude AI
        let responseText;
        try {
            responseText = await callClaudeAPI(messages);
            logEvent('claude_response_received', { 
                responseLength: responseText.length,
                hasOrderInfo: !!orderInfo 
            });
        } catch (error) {
            logEvent('claude_api_error', { 
                error: error.message,
                fallbackUsed: true 
            });
            responseText = getFallbackResponse(message);
        }

        // Format the response
        const formattedResponse = formatResponseAsHTML(responseText);

        // Log conversation for analytics (optional)
        logEvent('chat_interaction', {
            sessionId,
            userMessage: message.substring(0, 100),
            botResponsePreview: responseText.substring(0, 100) + '...',
            timestamp: new Date()
        });

        return new Response(JSON.stringify({
            response: formattedResponse,
            sessionId: sessionId || `session_${Date.now()}`,
            timestamp: new Date().toISOString(),
            success: true
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });

    } catch (error) {
        logEvent('chat_api_error', {
            error: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return new Response(JSON.stringify({
            response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment or contact our support team directly.",
            error: 'Internal server error',
            success: false
        }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
