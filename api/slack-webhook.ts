
interface SlackEvent {
    type: string;
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_ts: string;
}

interface SlackWebhookPayload {
    token?: string;
    challenge?: string; // For URL verification
    type: string;
    event?: SlackEvent;
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

function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

// Clean up old sessions (older than 24 hours)
function cleanupOldSessions() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [sessionId, session] of chatSessions.entries()) {
        if (session.lastActivity < cutoffTime) {
            chatSessions.delete(sessionId);
            slackThreadToSession.delete(session.slackThreadId);
        }
    }
}

// Run cleanup occasionally
if (Math.random() < 0.1) { // 10% chance on each request
    cleanupOldSessions();
}

export default async function handler(request: Request) {
    logEvent('slack_webhook_received', {
        method: request.method,
        url: request.url
    });

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await request.json();
        logEvent('slack_webhook_payload', { type: body.type });

        // Handle URL verification challenge
        if (body.type === 'url_verification') {
            logEvent('slack_url_verification', { challenge: body.challenge });
            return new Response(body.challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Handle incoming message events
        if (body.type === 'event_callback' && body.event) {
            const event: SlackEvent = body.event;
            
            // Ignore bot messages and messages not in threads
            if (!event.thread_ts || event.user === 'USLACKBOT') {
                logEvent('slack_event_ignored', { 
                    reason: 'bot_message_or_no_thread',
                    hasThreadTs: !!event.thread_ts,
                    user: event.user
                });
                return new Response('OK', { status: 200 });
            }

            // Find the session associated with this Slack thread
            const sessionId = slackThreadToSession.get(event.thread_ts);
            
            if (sessionId) {
                const session = chatSessions.get(sessionId);
                
                if (session) {
                    // Add the agent's message to the session
                    const agentMessage = {
                        id: `agent_${Date.now()}`,
                        content: event.text,
                        sender: 'agent' as const,
                        timestamp: new Date()
                    };
                    
                    session.messages.push(agentMessage);
                    session.lastActivity = Date.now();
                    
                    logEvent('slack_message_routed_to_session', {
                        sessionId,
                        threadId: event.thread_ts,
                        messagePreview: event.text.substring(0, 100)
                    });

                    // In a real-time system, you would push this message to the user's browser
                    // For now, we'll store it and let the chat widget poll for updates
                } else {
                    logEvent('slack_session_not_found', { 
                        sessionId,
                        threadId: event.thread_ts
                    });
                }
            } else {
                logEvent('slack_thread_not_mapped', { 
                    threadId: event.thread_ts
                });
            }
        }

        return new Response('OK', { status: 200 });

    } catch (error) {
        logEvent('slack_webhook_error', {
            error: error.message,
            stack: error.stack
        });
        
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Export helper functions for other API routes to use
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
