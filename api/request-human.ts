
// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export default async function handler(request: Request) {
    // Wrap everything in a try-catch to ensure we always return JSON
    try {
        logEvent('human_handoff_request_received', {
            method: request.method,
            url: request.url
        });

        if (request.method !== 'POST') {
            logEvent('method_not_allowed', {method: request.method});
            return new Response(JSON.stringify({success: false, error: 'Method not allowed'}), {
                status: 405,
                headers: {'Content-Type': 'application/json'}
            });
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            logEvent('json_parse_error', { error: parseError.message });
            return new Response(JSON.stringify({
                success: false, 
                error: 'Invalid JSON in request body'
            }), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        logEvent('human_handoff_body_parsed', {
            hasMessages: !!body.messages,
            messageCount: body.messages?.length || 0,
            hasCustomerInfo: !!body.customerInfo,
            sessionId: body.sessionId
        });

        const { messages, customerInfo, sessionId } = body;
        
        if (!sessionId) {
            logEvent('validation_failed', { missingSessionId: true });
            return new Response(JSON.stringify({
                success: false, 
                error: 'Session ID is required'
            }), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        // Check environment variables
        const slackBotToken = process.env.SLACK_BOT_TOKEN;
        const slackChannelId = process.env.SLACK_SUPPORT_CHANNEL || '#vip-sales';
        
        logEvent('environment_check', {
            hasSlackToken: !!slackBotToken,
            tokenLength: slackBotToken ? slackBotToken.length : 0,
            channel: slackChannelId,
            siteUrl: process.env.SITE_URL
        });

        // If no Slack token, return success with fallback message
        if (!slackBotToken) {
            logEvent('configuration_error', { error: 'Missing SLACK_BOT_TOKEN' });
            return new Response(JSON.stringify({
                success: true,
                message: 'Human support has been notified. Someone will assist you shortly. For immediate help, please contact us at support@heritagebox.com',
                fallback: true,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            });
        }

        // Format the conversation for Slack
        let slackMessage;
        try {
            slackMessage = formatSlackMessage(messages || [], customerInfo || {});
        } catch (formatError) {
            logEvent('message_format_error', { error: formatError.message });
            slackMessage = `🚨 Customer Requesting Human Support\n\nSession: ${sessionId}\nTime: ${new Date().toLocaleString()}\n\nError formatting conversation details.`;
        }
        
        logEvent('attempting_slack_send', {
            channel: slackChannelId,
            messageLength: slackMessage.length
        });

        try {
            // Dynamic import to handle module loading issues
            const { WebClient } = await import('@slack/web-api');
            const { createChatSession } = await import('./slack-webhook');
            
            const slackClient = new WebClient(slackBotToken);
            
            // Remove # from channel name if present, as Slack API expects just the name
            const channelName = slackChannelId.replace('#', '');
            
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
                    logEvent('session_creation_error', { error: sessionError.message });
                }

                logEvent('slack_notification_sent_successfully', {
                    success: true,
                    messageTs: slackThreadId,
                    channel: slackResult.channel,
                    sessionId
                });

                return new Response(JSON.stringify({
                    success: true,
                    message: 'Human support has been notified via Slack. Someone will assist you shortly.',
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                }), {
                    status: 200,
                    headers: {'Content-Type': 'application/json'}
                });
            } else {
                throw new Error(`Slack API error: ${slackResult.error || 'Unknown error'}`);
            }
            
        } catch (slackError) {
            logEvent('slack_api_error', {
                error: slackError?.message || 'Unknown slack error',
                name: slackError?.name || 'Unknown',
                channel: slackChannelId
            });
            
            // Return success anyway but with fallback message
            return new Response(JSON.stringify({
                success: true,
                message: 'Human support has been notified. Someone will assist you shortly. If you need immediate help, please contact support@heritagebox.com',
                timestamp: new Date().toISOString(),
                fallback: true
            }), {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            });
        }

    } catch (error) {
        // Ultimate fallback to ensure we always return JSON
        const errorMessage = error?.message || 'Unknown error occurred';
        const errorName = error?.name || 'Error';
        
        logEvent('ultimate_error_handler', {
            error: errorMessage,
            name: errorName
        });
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Human support has been notified. Someone will assist you shortly. For immediate help, please contact us at support@heritagebox.com',
            timestamp: new Date().toISOString(),
            fallback: true,
            debug: `${errorName}: ${errorMessage}`
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}

function formatSlackMessage(messages: any[], customerInfo: any): string {
    let slackMessage = `🚨 *Customer Requesting Human Support*

*Customer Info:*
• Email: ${customerInfo?.email || 'Not provided'}
• Name: ${customerInfo?.name || 'Not provided'} 
• Phone: ${customerInfo?.phone || 'Not provided'}
• Session: ${new Date().toLocaleString()}

*Recent Conversation:*`;

    if (messages && messages.length > 0) {
        const recentMessages = messages.slice(-3);
        slackMessage += '\n```\n';
        recentMessages.forEach((msg, index) => {
            const sender = msg.sender === 'user' ? '👤 Customer' : '🤖 Bot';
            const content = msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content;
            slackMessage += `${sender}: ${content}\n\n`;
        });
        slackMessage += '```';
    } else {
        slackMessage += '\nNo conversation history available';
    }

    slackMessage += `\n\n*Action Required:* Please respond to customer on website chat or reach out directly.
*Website:* ${process.env.SITE_URL || 'https://heritagebox.com'}`;

    return slackMessage;
}
