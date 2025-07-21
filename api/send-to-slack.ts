import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SendToSlackRequest {
    sessionId: string;
    message: string;
    sender: 'user' | 'agent';
}

function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false, 
            error: 'Method not allowed'
        });
    }

    const request = {
        method: req.method,
        url: req.url,
        json: async () => req.body
    };
    logEvent('send_to_slack_request_received', {
        method: request.method,
        url: request.url
    });

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({
            success: false, 
            error: 'Method not allowed'
        }), {
            status: 405,
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        const body = await request.json();
        const { sessionId, message, sender }: SendToSlackRequest = body;

        logEvent('send_to_slack_body_parsed', {
            sessionId,
            messageLength: message?.length || 0,
            sender
        });

        if (!sessionId || !message || !sender) {
            logEvent('validation_failed', { 
                missingSessionId: !sessionId,
                missingMessage: !message,
                missingSender: !sender
            });
            return new Response(JSON.stringify({
                success: false, 
                error: 'Session ID, message, and sender are required'
            }), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        // For now, return an error indicating this feature needs Redis setup
        logEvent('send_to_slack_not_available', { sessionId });
        
        return res.status(501).json({
            success: false,
            error: 'Direct message forwarding is not available without session storage configured',
            message: 'Please use the "Request Human Support" button to connect with our team.'
        });

    } catch (error) {
        logEvent('send_to_slack_error', {
            error: error.message,
            stack: error.stack
        });
        
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}

function formatMessageForSlack(message: string, sender: 'user' | 'agent'): string {
    // Convert HTML to plain text and add sender context
    let cleanMessage = message
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
        .replace(/<em>(.*?)<\/em>/gi, '_$1_')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .trim();

    // Add sender prefix for clarity
    const prefix = sender === 'user' ? '👤 **Customer:**' : '🤖 **Bot:**';
    
    return `${prefix} ${cleanMessage}`;
}
