// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

// In-memory session storage (in production, use Redis or database)
interface ChatSession {
    sessionId: string;
    slackThreadId: string;
    userId?: string;
    lastActivity: number;
    messages: Array<{
        id: string;
        content: string;
        sender: 'user' | 'bot' | 'agent';
        timestamp: Date;
    }>;
}

// Simple in-memory store (replace with Redis in production)
const chatSessions = new Map<string, ChatSession>();
// Store session by Slack thread ID for reverse lookup
const slackThreadToSession = new Map<string, string>();

export function getChatSession(sessionId: string): ChatSession | undefined {
    return chatSessions.get(sessionId);
}

export function createChatSession(sessionId: string, slackThreadId: string): ChatSession {
    const session: ChatSession = {
        sessionId,
        slackThreadId,
        lastActivity: Date.now(),
        messages: []
    };
    
    chatSessions.set(sessionId, session);
    slackThreadToSession.set(slackThreadId, sessionId);
    
    logEvent('chat_session_created', { sessionId, slackThreadId });
    return session;
}

export function updateChatSession(sessionId: string, message: any) {
    const session = chatSessions.get(sessionId);
    if (session) {
        session.messages.push(message);
        session.lastActivity = Date.now();
        chatSessions.set(sessionId, session);
    }
}

export default async function handler(request: Request) {
    // Set CORS headers
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        logEvent('human_handoff_request_received', {
            method: request.method,
            url: request.url,
            timestamp: new Date().toISOString()
        });

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({
                success: false, 
                error: 'Method not allowed'
            }), {
                status: 405,
                headers: corsHeaders
            });
        }

        let body: any = {};
        try {
            const requestText = await request.text();
            if (requestText) {
                body = JSON.parse(requestText);
            }
        } catch (parseError) {
            logEvent('json_parse_error', { 
                error: (parseError as Error).message 
            });
            return new Response(JSON.stringify({
                success: false, 
                error: 'Invalid JSON in request body'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const { sessionId, messages, customerInfo } = body;

        // Get environment variables
        const slackBotToken = process.env.SLACK_BOT_TOKEN;
        const slackChannelId = process.env.SLACK_SUPPORT_CHANNEL || '#vip-sales';

        if (!slackBotToken) {
            logEvent('missing_slack_token', {});
            return new Response(JSON.stringify({
                success: true,
                message: 'Your request has been received. Our support team will contact you shortly. For immediate assistance, please email support@heritagebox.com',
                sessionId: sessionId || `session_${Date.now()}`,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

        // Format the conversation history for Slack
        const conversationSummary = messages && messages.length > 0 
            ? messages.map((msg: any) => `${msg.sender.toUpperCase()}: ${msg.content}`).join('\n')
            : 'No conversation history available';

        const customerDetails = customerInfo ? 
            `Customer Info: ${JSON.stringify(customerInfo, null, 2)}` : 
            'No customer details provided';

        const slackMessage = `🆘 *New Human Support Request* 
        
📋 *Session ID:* ${sessionId}
⏰ *Time:* ${new Date().toLocaleString()}
🌐 *Website:* ${process.env.SITE_URL || 'heritagebox.com'}

👤 *Customer Details:*
${customerDetails}

💬 *Conversation History:*
\`\`\`
${conversationSummary}
\`\`\`

Please respond in this thread to continue the conversation with the customer.`;

        try {
            // Use dynamic import to handle potential module loading issues
            let WebClient;
            try {
                const slackModule = await import('@slack/web-api');
                WebClient = slackModule.WebClient;
            } catch (importError) {
                logEvent('slack_import_error', { error: (importError as Error).message });
                // Fallback if import fails
                throw new Error('Slack module not available');
            }

            const slackClient = new WebClient(slackBotToken);
            
            // Remove # from channel name if present
            const channelName = slackChannelId.replace('#', '');
            
            logEvent('sending_slack_message', {
                channel: channelName,
                sessionId,
                messageLength: slackMessage.length
            });

            const slackResult = await slackClient.chat.postMessage({
                channel: channelName,
                text: slackMessage,
                unfurl_links: false,
                unfurl_media: false
            });

            logEvent('slack_api_response', {
                ok: slackResult.ok,
                error: slackResult.error,
                channel: slackResult.channel,
                ts: slackResult.ts
            });

            if (slackResult.ok && slackResult.ts) {
                const slackThreadId = slackResult.ts;
                
                try {
                    // Create chat session for bidirectional communication
                    createChatSession(sessionId, slackThreadId);
                } catch (sessionError) {
                    logEvent('session_creation_error', { error: (sessionError as Error).message });
                }

                return new Response(JSON.stringify({
                    success: true,
                    message: 'Human support has been notified via Slack. Our team will assist you shortly. You can continue chatting here and our agent will respond directly in this chat.',
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                }), {
                    status: 200,
                    headers: corsHeaders
                });
            } else {
                throw new Error(`Slack API error: ${slackResult.error || 'Unknown error'}`);
            }
            
        } catch (slackError) {
            logEvent('slack_error', {
                error: (slackError as Error).message,
                sessionId
            });
            
            // Fallback response if Slack fails
            return new Response(JSON.stringify({
                success: true,
                message: 'Your request for human support has been received. Our team has been notified and will contact you shortly. For immediate assistance, please call us or email support@heritagebox.com',
                sessionId: sessionId || `session_${Date.now()}`,
                timestamp: new Date().toISOString(),
                note: 'Slack notification may have failed, but request was logged'
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

    } catch (error) {
        logEvent('ultimate_error_handler', {
            error: (error as Error)?.message || 'Unknown error',
            name: (error as Error)?.name || 'Error'
        });
        
        // Ensure we always return valid JSON
        return new Response(JSON.stringify({
            success: true,
            message: 'Your request has been received. Our support team will contact you shortly. For immediate help, please contact support@heritagebox.com',
            timestamp: new Date().toISOString(),
            fallback: true
        }), {
            status: 200,
            headers: corsHeaders
        });
    }
}
