export const config = {
    runtime: 'edge',
};

interface SlackEvent {
    type: string;
    channel: string;
    user?: string;
    text?: string;
    ts?: string;
    thread_ts?: string;
    event_ts: string;
    subtype?: string;
    bot_id?: string;
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
            
            logEvent('slack_event_received', {
                type: event.type,
                hasThreadTs: !!event.thread_ts,
                user: event.user,
                messagePreview: event.text?.substring(0, 50)
            });
            
            // Only process message events in threads (ignore channel messages and bot messages)
            if (event.type === 'message' && event.thread_ts && event.user && event.user !== 'USLACKBOT') {
                // Check if this is a bot message by looking for subtype
                if (event.subtype && event.subtype === 'bot_message') {
                    logEvent('slack_bot_message_ignored', { 
                        threadId: event.thread_ts,
                        subtype: event.subtype
                    });
                    return new Response('OK', { status: 200 });
                }

                // Find the session associated with this Slack thread
                const sessionId = slackThreadToSession.get(event.thread_ts);
                
                if (sessionId) {
                    const session = chatSessions.get(sessionId);
                    
                    if (session) {
                        // Check if this message is from a human agent (not our bot)
                        const isHumanAgent = !event.bot_id && event.user && event.user !== 'USLACKBOT';
                        
                        if (isHumanAgent && event.text) {
                            // Clean the message text (remove formatting that was added by our bot)
                            let cleanText = event.text;
                            
                            // Remove our bot prefixes if they exist
                            cleanText = cleanText
                                .replace(/^👤\s*\*\*Customer:\*\*\s*/gi, '')
                                .replace(/^🤖\s*\*\*Bot:\*\*\s*/gi, '')
                                .replace(/^\*\*(.*?)\*\*:\s*/gi, '') // Remove any **prefix:**
                                .trim();

                            // Add the agent's message to the session
                            const agentMessage = {
                                id: `agent_${event.ts || Date.now()}`,
                                content: cleanText,
                                sender: 'agent' as const,
                                timestamp: new Date()
                            };
                            
                            session.messages.push(agentMessage);
                            session.lastActivity = Date.now();
                            
                            logEvent('agent_message_added_to_session', {
                                sessionId,
                                threadId: event.thread_ts,
                                messageId: agentMessage.id,
                                messagePreview: cleanText.substring(0, 100),
                                originalText: event.text.substring(0, 100)
                            });
                        } else {
                            logEvent('slack_message_ignored_not_human', { 
                                threadId: event.thread_ts,
                                user: event.user,
                                botId: event.bot_id,
                                reason: 'not_human_agent'
                            });
                        }
                    } else {
                        logEvent('slack_session_not_found', { 
                            sessionId,
                            threadId: event.thread_ts
                        });
                    }
                } else {
                    logEvent('slack_thread_not_mapped', { 
                        threadId: event.thread_ts,
                        availableThreads: Array.from(slackThreadToSession.keys())
                    });
                }
            } else {
                logEvent('slack_event_ignored', { 
                    reason: 'not_threaded_message_or_bot',
                    type: event.type,
                    hasThreadTs: !!event.thread_ts,
                    user: event.user,
                    subtype: event.subtype
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
