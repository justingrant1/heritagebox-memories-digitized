// In-memory session storage (in a real production environment, this should be replaced with Vercel KV or another persistent store)

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
    debugLog: string[];
}

// These maps will be shared across all API routes in the local dev environment.
const chatSessions = new Map<string, ChatSession>();
const slackThreadToSession = new Map<string, string>();

function logEvent(event: string, data: any, session?: ChatSession) {
    const logMessage = `[${new Date().toLocaleTimeString()}] ${event}: ${JSON.stringify(data)}`;
    console.log(logMessage);
    if (session) {
        session.debugLog.push(logMessage);
    }
}

// Export functions to manage the shared state
export function getChatSession(sessionId: string): ChatSession | undefined {
    const session = chatSessions.get(sessionId);
    logEvent('get_chat_session_called', { sessionId, found: !!session }, session);
    return session;
}

export function getSessionBySlackThread(thread_ts: string): ChatSession | undefined {
    const sessionId = slackThreadToSession.get(thread_ts);
    const session = sessionId ? chatSessions.get(sessionId) : undefined;
    logEvent('get_session_by_slack_thread_called', { 
        thread_ts, 
        foundSessionId: sessionId,
        map: Array.from(slackThreadToSession.entries()) 
    }, session);
    return session;
}

export function createChatSession(sessionId: string, slackThreadId: string): ChatSession {
    const session: ChatSession = {
        sessionId,
        slackThreadId,
        lastActivity: Date.now(),
        messages: [],
        debugLog: []
    };
    
    chatSessions.set(sessionId, session);
    slackThreadToSession.set(slackThreadId, sessionId);
    
    logEvent('chat_session_created', { 
        sessionId, 
        slackThreadId, 
        sessionMapSize: chatSessions.size,
        threadMapSize: slackThreadToSession.size
    }, session);
    return session;
}

export function addMessageToSession(sessionId: string, message: any) {
    const session = getChatSession(sessionId);
    if (session) {
        session.messages.push(message);
        session.lastActivity = Date.now();
        logEvent('message_added_to_session', { 
            sessionId, 
            messageId: message.id,
            newMessageCount: session.messages.length
        }, session);
    } else {
        // Cannot log to a session that doesn't exist
        logEvent('add_message_failed_session_not_found', { sessionId }, undefined);
    }
}
