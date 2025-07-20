// Store active conversations in memory (use Redis/database in production)
const activeConversations = new Map();

// Helper function for structured logging
function logEvent(event, data) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

/**
 * POST /api/request-human
 * Initiates human handoff process
 */
export default async function handler(req, res) {
    // Wrap everything in try-catch to prevent any unhandled errors
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
        }

        // Ensure we have a request body
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            });
        }

        const { 
            customerName, 
            customerEmail, 
            customerPhone,
            messages: chatHistory, 
            urgency = 'medium',
            sessionId 
        } = req.body;

        // Generate unique conversation ID
        const conversationId = `HB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Log the request for debugging
        logEvent('human_handoff_request', {
            conversationId,
            customerName: customerName || 'Not provided',
            hasEmail: !!customerEmail,
            hasPhone: !!customerPhone,
            urgency,
            sessionId: sessionId || 'Not provided'
        });
        
        // Get environment variables
        const slackBotToken = process.env.SLACK_BOT_TOKEN;
        const VIP_CHANNEL = process.env.SLACK_SUPPORT_CHANNEL || '#vip-sales';

        if (!slackBotToken) {
            logEvent('missing_slack_token', { conversationId });
            return res.status(200).json({
                success: true,
                conversationId,
                message: "Your request has been received. Our support team will contact you shortly.",
                estimatedWaitTime: "2-5 minutes"
            });
        }

        // Create rich message for Slack
        const slackMessage: any = {
            channel: VIP_CHANNEL.replace('#', ''),
            text: `🆘 Customer requesting human assistance`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🆘 Customer Needs Human Help"
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Customer:* ${customerName || 'Not provided'}`
                        },
                        {
                            type: "mrkdwn", 
                            text: `*Email:* ${customerEmail || 'Not provided'}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Phone:* ${customerPhone || 'Not provided'}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Urgency:* ${urgency.toUpperCase()}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Conversation ID:* \`${conversationId}\``
                        },
                        {
                            type: "mrkdwn",
                            text: `*Time:* ${new Date().toLocaleString()}`
                        }
                    ]
                }
            ]
        };

        // Add chat history if available
        if (chatHistory && chatHistory.length > 0) {
            const historyText = chatHistory
                .slice(-5) // Last 5 messages
                .map(msg => `*${msg.sender}:* ${msg.content}`)
                .join('\n');
            
            slackMessage.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Recent Chat History:*\n${historyText}`
                }
            });
        }

        // Add action buttons
        slackMessage.blocks.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Take This Customer"
                    },
                    style: "primary",
                    action_id: "take_customer",
                    value: conversationId
                },
                {
                    type: "button", 
                    text: {
                        type: "plain_text",
                        text: "Mark as Handled"
                    },
                    action_id: "mark_handled",
                    value: conversationId
                }
            ]
        });

        // Send message to Slack using fetch
        const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${slackBotToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(slackMessage)
        });

        const slackResult = await slackResponse.json();
        
        // Store conversation data
        activeConversations.set(conversationId, {
            customerName,
            customerEmail, 
            customerPhone,
            chatHistory,
            sessionId,
            slackMessageTs: slackResult.ts,
            slackChannel: slackResult.channel,
            status: 'waiting',
            createdAt: new Date(),
            assignedAgent: null
        });

        logEvent('human_handoff_created', {
            conversationId,
            customerName,
            customerEmail,
            slackOk: slackResult.ok
        });

        res.json({
            success: true,
            conversationId,
            message: "Your request has been sent to our team. A human agent will be with you shortly.",
            estimatedWaitTime: "2-5 minutes"
        });

    } catch (error) {
        console.error('Human handoff error:', error);
        logEvent('human_handoff_error', { error: error.message });
        
        res.status(500).json({
            success: false,
            message: "Sorry, we're having trouble connecting you to an agent. Please try again or call us directly."
        });
    }
}
