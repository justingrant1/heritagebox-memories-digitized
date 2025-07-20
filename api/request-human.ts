
import { WebClient } from '@slack/web-api';
import { createChatSession } from './slack-webhook';

// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export default async function handler(request: Request) {
    logEvent('human_handoff_request_received', {
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
        logEvent('human_handoff_body_parsed', {
            hasMessages: !!body.messages,
            messageCount: body.messages?.length || 0
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

        // Format the conversation for Slack
        let conversationSummary = "🚨 **Customer Requesting Human Support**\n\n";
        
        if (customerInfo) {
            conversationSummary += `**Customer Info:**\n`;
            conversationSummary += `• Email: ${customerInfo.email || 'Not provided'}\n`;
            conversationSummary += `• Name: ${customerInfo.name || 'Not provided'}\n`;
            conversationSummary += `• Phone: ${customerInfo.phone || 'Not provided'}\n\n`;
        }

        conversationSummary += `**Recent Conversation:**\n`;
        
        if (messages && messages.length > 0) {
            // Show last 5 messages
            const recentMessages = messages.slice(-5);
            recentMessages.forEach((msg, index) => {
                const sender = msg.sender === 'user' ? '👤 Customer' : '🤖 AI Bot';
                const content = msg.content.length > 150 ? msg.content.substring(0, 150) + '...' : msg.content;
                conversationSummary += `${sender}: ${content}\n\n`;
            });
        } else {
            conversationSummary += "No conversation history available.\n\n";
        }

        conversationSummary += `**Time:** ${new Date().toLocaleString()}\n`;
        conversationSummary += `**Action Required:** Please respond to customer on website chat or reach out directly.\n`;
        conversationSummary += `**Website:** ${process.env.SITE_URL || 'https://heritagebox.com'}`;

        // Send to Slack using MCP Server for more reliable delivery
        const slackChannelId = process.env.SLACK_SUPPORT_CHANNEL || '#vip-sales';
        
        logEvent('sending_slack_notification', {
            channel: slackChannelId,
            messageLength: conversationSummary.length
        });

        try {
            const slackBotToken = process.env.SLACK_BOT_TOKEN;
            if (!slackBotToken) {
                throw new Error('Slack bot token not configured');
            }

            const slackClient = new WebClient(slackBotToken);
            
            const slackMessage = `🚨 **Customer Requesting Human Support**

**Customer Info:**
• Email: ${customerInfo?.email || 'Not provided'}
• Name: ${customerInfo?.name || 'Not provided'} 
• Phone: ${customerInfo?.phone || 'Not provided'}

**Recent Conversation:**
${messages && messages.length > 0 
    ? messages.slice(-3).map(msg => {
        const sender = msg.sender === 'user' ? '👤 Customer' : '🤖 Bot';
        const content = msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content;
        return `${sender}: ${content}`;
    }).join('\n\n')
    : 'No conversation history available'
}

**Time:** ${new Date().toLocaleString()}
**Action Required:** Please respond to customer on website chat or reach out directly.
**Website:** ${process.env.SITE_URL || 'https://heritagebox.com'}`;

            const slackResult = await slackClient.chat.postMessage({
                channel: slackChannelId.replace('#', ''),
                text: slackMessage,
                unfurl_links: false,
                unfurl_media: false
            });

            if (slackResult.ok) {
                const slackThreadId = slackResult.ts;
                logEvent('slack_notification_sent', {
                    success: true,
                    messageTs: slackThreadId,
                    channel: slackResult.channel,
                    sessionId
                });

                if (slackThreadId) {
                    createChatSession(sessionId, slackThreadId);
                }

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
                throw new Error(`Slack API error: ${slackResult.error}`);
            }
        } catch (slackError) {
            logEvent('slack_notification_failed', {
                error: slackError.message,
                channel: slackChannelId,
                stack: slackError.stack
            });
            console.error('Failed to send Slack notification:', slackError);
        }

        logEvent('human_handoff_completed', {
            success: true,
            channel: slackChannelId
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Human support has been notified. Someone will assist you shortly.',
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });

    } catch (error) {
        logEvent('human_handoff_error', {
            error: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return new Response(JSON.stringify({
            success: false,
            error: 'Unable to connect to human support at this time',
            message: 'Please try again in a moment or contact us directly at support@heritagebox.com'
        }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
