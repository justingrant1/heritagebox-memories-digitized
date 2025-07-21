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

interface VercelRequest {
  method: string;
  body: any;
  url?: string;
  headers: { [key: string]: string | string[] | undefined };
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(obj: any): VercelResponse;
  setHeader(name: string, value: string): void;
  end(): void;
}

// Simple in-memory session storage (for basic functionality)
const sessions = new Map<string, ClaudeMessage[]>();

// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

// Generate system prompt with current pricing
const generateSystemPrompt = () => {
  return `You are Helena, the helpful AI assistant for Heritagebox - a professional media digitization service.

You help customers with:
- Pricing quotes for photo scanning, video transfer, film digitization
- Project status updates and order tracking  
- Service information and turnaround times
- Technical questions about digitization processes

Be friendly, professional, and knowledgeable. Always try to provide specific, helpful information.

CURRENT PRICING:
📦 DIGITIZATION PACKAGES:
- Starter Package: $149 (up to 100 photos + basic video)
- Popular Package: $299 (up to 500 photos + multiple videos)
- Dusty Rose Package: $499 (up to 1000 photos + comprehensive video transfer)
- Eternal Package: $799 (unlimited photos + premium services)

🔧 ADD-ON SERVICES:
- USB Drive: $25
- Online Gallery: $15
- Photo Restoration: $5-15 per photo
- Rush Processing: $50-100

Current turnaround times:
- Standard processing: 2-3 weeks
- Express processing: 1 week (+$50)
- Rush processing: 3-5 days (+$100)

IMPORTANT INSTRUCTIONS:
- Always use the current pricing information provided above
- For specific order status, ask for order number, email, or customer details
- Be helpful, professional, and encourage customers to visit our website for full package details
- If customers seem interested in ordering, mention they can visit the website to place orders`;
};

// Claude AI integration with improved error handling
async function callClaudeAPI(messages: ClaudeMessage[], systemPrompt?: string) {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    logEvent('claude_api_key_missing', { message: 'Claude API key not configured' });
    throw new Error('AI service not configured. Please contact support.');
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
      system: systemPrompt || generateSystemPrompt(),
      messages: messages
    };

    logEvent('claude_request_details', { 
      model: requestBody.model, 
      systemLength: requestBody.system.length,
      messageCount: requestBody.messages.length 
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    logEvent('claude_response_received', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      logEvent('claude_api_error', { 
        status: response.status, 
        statusText: response.statusText,
        errorBody: errorText.substring(0, 500)
      });
      
      if (response.status === 429) {
        throw new Error('Service is temporarily busy. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('API authentication failed. Please contact support.');
      } else if (response.status >= 500) {
        throw new Error('AI service is temporarily unavailable. Please try again shortly.');
      } else {
        throw new Error(`AI service returned error (${response.status}). Please try again.`);
      }
    }

    const result = await response.json();
    logEvent('claude_response_parsed', { 
      hasContent: !!result.content,
      contentLength: result.content?.[0]?.text?.length || 0,
      usage: result.usage || null
    });

    if (!result.content || !result.content[0] || !result.content[0].text) {
      logEvent('claude_invalid_response', { result: JSON.stringify(result).substring(0, 200) });
      throw new Error('AI service returned an invalid response format.');
    }

    return result.content[0].text;
  } catch (error: any) {
    logEvent('claude_api_exception', {
      message: error.message,
      name: error.name,
      isAbortError: error.name === 'AbortError'
    });
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw error;
  }
}

// Cleanup old sessions (basic memory management)
const cleanupOldSessions = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId] of sessions.entries()) {
    // For simplicity, clean up sessions after 30 minutes
    // In production, you might want more sophisticated session management
    const sessionAge = now - parseInt(sessionId.split('_')[1] || '0');
    if (sessionAge > maxAge) {
      sessions.delete(sessionId);
      logEvent('session_cleanup', { sessionId: sessionId.substring(0, 8) + '...' });
    }
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupOldSessions, 30 * 60 * 1000);

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for chat
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, sessionId } = req.body as ChatRequest;

    if (!message || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message and sessionId are required' 
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message cannot be empty' 
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message too long. Please keep messages under 4000 characters.' 
      });
    }

    logEvent('chat_request_received', { 
      sessionId: sessionId.substring(0, 12) + '...', 
      messageLength: message.length 
    });

    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
      logEvent('session_created', { sessionId: sessionId.substring(0, 12) + '...' });
    }

    const sessionMessages = sessions.get(sessionId)!;
    
    // Add user message to session
    sessionMessages.push({ role: 'user', content: message });

    // Keep only last 10 messages to avoid token limits and memory issues
    const recentMessages = sessionMessages.slice(-10);

    // Generate dynamic system prompt
    const systemPrompt = generateSystemPrompt();

    // Call Claude AI
    const assistantMessage = await callClaudeAPI(recentMessages, systemPrompt);

    // Add assistant response to session
    sessionMessages.push({ role: 'assistant', content: assistantMessage });

    // Keep session size manageable
    if (sessionMessages.length > 20) {
      sessions.set(sessionId, sessionMessages.slice(-15));
    }

    logEvent('chat_response_success', { 
      sessionId: sessionId.substring(0, 12) + '...',
      responseLength: assistantMessage.length,
      sessionMessageCount: sessionMessages.length
    });

    return res.json({ 
      success: true, 
      response: assistantMessage,
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logEvent('chat_error', { 
      error: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    let errorMessage = 'I apologize, but I\'m having technical difficulties right now. Please try again in a moment.';
    let statusCode = 500;
    
    if (error.message?.includes('not configured')) {
      errorMessage = 'AI service configuration issue. Please contact support@heritagebox.com';
      statusCode = 503;
    } else if (error.message?.includes('busy') || error.message?.includes('rate limit')) {
      errorMessage = 'Service is temporarily busy. Please try again in a moment.';
      statusCode = 429;
    } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      errorMessage = 'Request timed out. Please try again with a shorter message.';
      statusCode = 408;
    } else if (error.message?.includes('unavailable')) {
      errorMessage = 'AI service is temporarily unavailable. Please try again shortly.';
      statusCode = 503;
    }

    return res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
