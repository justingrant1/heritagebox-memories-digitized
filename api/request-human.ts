export const config = {
    runtime: 'edge',
};

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

        const { messages, customerInfo } = body;

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

        // Send to Slack using Web API
        const slackBotToken = process.env.SLACK_BOT_TOKEN;
        const slackChannelId = process.env.SLACK_SUPPORT_CHANNEL || '#customer-support';
        
        if (slackBotToken) {
            logEvent('sending_slack_notification', {
                channel: slackChannelId,
                messageLength: conversationSummary.length
            });

            try {
                const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${slackBotToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        channel: slackChannelId,
                        text: conversationSummary,
                        blocks: [
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: '🚨 *Customer Requesting Human Support*'
                                }
                            },
                            {
                                type: 'section',
                                fields: [
                                    {
                                        type: 'mrkdwn',
                                        text: `*Customer:* ${customerInfo?.name || 'Not provided'}`
                                    },
                                    {
                                        type: 'mrkdwn',
                                        text: `*Email:* ${customerInfo?.email || 'Not provided'}`
                                    },
                                    {
                                        type: 'mrkdwn',
                                        text: `*Time:* ${new Date().toLocaleString()}`
                                    },
                                    {
                                        type: 'mrkdwn',
                                        text: `*Status:* Awaiting human response`
                                    }
                                ]
                            },
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: '*Recent Conversation:*\n' + (messages && messages.length > 0 
                                        ? messages.slice(-3).map(msg => {
                                            const sender = msg.sender === 'user' ? '👤 Customer' : '🤖 Bot';
                                            return `${sender}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`;
                                        }).join('\n\n')
                                        : 'No conversation history')
                                }
                            },
                            {
                                type: 'actions',
                                elements: [
                                    {
                                        type: 'button',
                                        text: {
                                            type: 'plain_text',
                                            text: 'Respond on Website'
                                        },
                                        style: 'primary',
                                        url: process.env.SITE_URL || 'https://heritagebox.com'
                                    },
                                    {
                                        type: 'button',
                                        text: {
                                            type: 'plain_text',
                                            text: 'Call Customer'
                                        },
                                        style: 'danger'
                                    }
                                ]
                            }
                        ]
                    })
                });

                const slackResult = await slackResponse.json();
                
                if (!slackResult.ok) {
                    throw new Error(`Slack API error: ${slackResult.error}`);
                }

                logEvent('slack_notification_sent', {
                    success: true,
                    messageTs: slackResult.ts,
                    channel: slackResult.channel
                });

            } catch (slackError) {
                logEvent('slack_notification_failed', {
                    error: slackError.message,
                    channel: slackChannelId
                });
                
                // Continue anyway - don't fail the request just because Slack failed
                console.error('Failed to send Slack notification:', slackError);
            }
        } else {
            logEvent('slack_token_missing', {
                message: 'SLACK_BOT_TOKEN not configured, skipping Slack notification'
            });
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
