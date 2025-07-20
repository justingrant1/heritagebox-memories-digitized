

import { getChatSession } from './slack-webhook';

interface GetMessagesRequest {
    sessionId: string;
    lastMessageId?: string;
}

function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export default async function handler(req, res) {
    logEvent('chat_messages_request_received', {
        method: req.method,
        url: req.url
    });

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false, 
            error: 'Method not allowed'
        });
    }

    try {
        const { sessionId, lastMessageId } = req.query;

        if (!sessionId) {
            logEvent('validation_failed', { missingSessionId: true });
            return res.status(400).json({
                success: false, 
                error: 'Session ID is required'
            });
        }

        // Get the chat session
        const session = getChatSession(sessionId as string);
        
        if (!session) {
            logEvent('session_not_found', { sessionId });
            return res.status(200).json({
                success: true,
                messages: [],
                sessionExists: false
            });
        }

        // Get messages after the last message ID
        let messagesToReturn = session.messages;
        
        if (lastMessageId) {
            const lastIndex = session.messages.findIndex(msg => msg.id === lastMessageId);
            if (lastIndex !== -1) {
                messagesToReturn = session.messages.slice(lastIndex + 1);
            }
        }

        // Filter out user messages to avoid duplicates (user already has them)
        const newMessages = messagesToReturn.filter(msg => msg.sender !== 'user');

        logEvent('chat_messages_retrieved', {
            sessionId,
            totalMessages: session.messages.length,
            newMessages: newMessages.length,
            lastMessageId
        });

        return res.status(200).json({
            success: true,
            messages: newMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender,
                timestamp: msg.timestamp.toISOString()
            })),
            sessionExists: true,
            lastActivity: new Date(session.lastActivity).toISOString()
        });

    } catch (error) {
        logEvent('chat_messages_error', {
            error: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
