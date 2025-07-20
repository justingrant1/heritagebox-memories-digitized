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
    throw new Error('Claude API key not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
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
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    return getFallbackResponse();
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

function getFallbackResponse(): string {
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
            responseText = getFallbackResponse();
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
