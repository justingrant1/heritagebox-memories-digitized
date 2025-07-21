// Generic API endpoint for human handoff requests
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Only POST requests are supported.' 
    });
  }

  try {
    const { messages, customerInfo, sessionId } = req.body;

    console.log('Human handoff request received:', {
      sessionId,
      messageCount: messages?.length,
      hasCustomerInfo: !!customerInfo,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    // Format conversation history for Slack
    const conversationSummary = messages
      .map(msg => `**${msg.sender.toUpperCase()}**: ${msg.content}`)
      .join('\n\n');

    const customerDetails = customerInfo ? 
      `**Customer Info:**\n${customerInfo.name ? `Name: ${customerInfo.name}\n` : ''}${customerInfo.email ? `Email: ${customerInfo.email}\n` : ''}${customerInfo.phone ? `Phone: ${customerInfo.phone}\n` : ''}` : 
      'No customer contact info provided';

    const slackMessage = `🆘 **HUMAN HANDOFF REQUEST**
Session ID: \`${sessionId}\`
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

${customerDetails}

**Conversation History:**
${conversationSummary}

---
*A customer is requesting human assistance. Please join the conversation by responding in this thread.*`;

    // Get Slack webhook URL from environment
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_URL not configured');
      return res.status(500).json({
        success: false,
        error: 'Human handoff service not configured. Please contact support directly.',
        message: 'Our human handoff service is temporarily unavailable. Please contact us directly at support@heritagebox.com'
      });
    }

    // Send to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: slackMessage,
        channel: process.env.SLACK_CHANNEL || '#customer-support',
        username: 'HeritagebotHandoff',
        icon_emoji: ':sos:'
      }),
    });

    if (!slackResponse.ok) {
      const slackError = await slackResponse.text();
      console.error('Slack webhook failed:', {
        status: slackResponse.status,
        error: slackError
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to notify support team',
        message: 'Unable to connect to our support team right now. Please contact us directly at support@heritagebox.com'
      });
    }

    console.log('Human handoff request sent to Slack successfully');

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Your request has been forwarded to our support team! A human agent will join this conversation shortly.',
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in human handoff:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error during handoff process',
      message: 'Sorry, there was a problem connecting you to our support team. Please try again or contact us directly at support@heritagebox.com'
    });
  }
}
