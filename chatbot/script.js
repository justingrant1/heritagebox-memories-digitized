let chatOpen = false;
let sessionId = null;
let conversationHistory = [];

// Initialize session when page loads
window.addEventListener('load', () => {
    sessionId = generateSessionId();
});

function generateSessionId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatToggle = document.querySelector('.chat-toggle');
    
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatWindow.classList.add('open');
        chatToggle.innerHTML = '✕';
    } else {
        chatWindow.classList.remove('open');
        chatToggle.innerHTML = '💬';
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendQuickMessage(message) {
    document.getElementById('messageInput').value = message;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Disable send button during processing
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    
    // Add user message
    addMessage(message, 'user');
    conversationHistory.push({ sender: 'user', content: message, timestamp: new Date() });
    input.value = '';
    
    // Show typing indicator
    showTyping();
    
    try {
        // Send message to enhanced backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                sessionId: sessionId
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Update session ID if provided
        if (data.sessionId) {
            sessionId = data.sessionId;
        }
        
        // Hide typing indicator
        hideTyping();
        
        // Add bot response with enhanced formatting
        addMessage(data.response, 'bot');
        conversationHistory.push({ sender: 'assistant', content: data.response, timestamp: new Date() });
        
        // Handle structured data responses
        if (data.structured) {
            handleStructuredResponse(data.structured);
        }
        
        // Add contextual quick actions based on analysis
        if (data.analysis) {
            addContextualActions(data.analysis);
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideTyping();
        
        // Fallback to simulated response if API fails
        const fallbackResponse = getSimulatedResponse(message);
        addMessage(fallbackResponse, 'bot');
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
    }
}

function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Remove existing quick actions before scrolling
    const existingActions = messagesContainer.querySelector('.quick-actions');
    if (existingActions && existingActions !== messagesContainer.lastElementChild) {
        existingActions.remove();
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleStructuredResponse(structured) {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (structured.type === 'quote') {
        // Add a structured quote card
        const quoteCard = document.createElement('div');
        quoteCard.className = 'message bot';
        quoteCard.innerHTML = `
            <div class="message-content quote-card" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px; padding: 15px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>💰 <strong>Quote Total</strong></div>
                    <div style="font-size: 20px; font-weight: bold;">${structured.formatted}</div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(quoteCard);
    } else if (structured.type === 'order_status') {
        // Add visual indicator for order status updates
        const statusCard = document.createElement('div');
        statusCard.className = 'message bot';
        statusCard.innerHTML = `
            <div class="message-content" style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 12px;">
                📦 <strong>Order Status Updated</strong><br>
                <small>Information retrieved from your account</small>
            </div>
        `;
        messagesContainer.appendChild(statusCard);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addContextualActions(analysis) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Remove existing quick actions
    const existingActions = messagesContainer.querySelector('.quick-actions');
    if (existingActions) {
        existingActions.remove();
    }
    
    let actions = [];
    
    switch (analysis.intent) {
        case 'pricing':
            actions = [
                'Get detailed quote',
                'Rush service pricing',
                'Bulk discount info',
                'Speak with sales team'
            ];
            break;
        case 'order_status':
            actions = [
                'Track another order',
                'Update my information',
                'Request status update',
                'Contact support'
            ];
            break;
        case 'service_inquiry':
            actions = [
                'Get pricing quote',
                'Compare services',
                'Check turnaround time',
                'Book consultation'
            ];
            break;
        default:
            if (analysis.urgency === 'high') {
                actions = [
                    'Rush service options',
                    'Speak with manager',
                    'Emergency processing'
                ];
            } else {
                actions = [
                    'Get pricing quote',
                    'Check order status',
                    'Service options',
                    'Contact support'
                ];
            }
    }
    
    if (actions.length > 0) {
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = actions.map(action => 
            `<button class="quick-action" onclick="sendQuickMessage('${action}')">${action}</button>`
        ).join('');
        
        messagesContainer.appendChild(quickActions);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showTyping() {
    document.getElementById('typingIndicator').style.display = 'block';
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function hideTyping() {
    document.getElementById('typingIndicator').style.display = 'none';
}

// Enhanced fallback responses for when the API is not available
function getSimulatedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('scan')) {
        return `📸 <strong>Photo Digitization Pricing:</strong><br><br>
        • Standard photos: $0.50 each<br>
        • Large photos (8x10+): $1.00 each<br>
        • Slides/negatives: $0.75 each<br>
        • Bulk discounts: 5% (50+ items), 10% (100+ items), 15% (500+ items)<br><br>
        All photos are scanned at 600 DPI with professional color correction included. Would you like me to create a custom quote for your collection?`;
    }
    
    if (lowerMessage.includes('video') || lowerMessage.includes('tape') || lowerMessage.includes('film')) {
        return `🎬 <strong>Video Transfer Options:</strong><br><br>
        • VHS/VHS-C: $25 per tape<br>
        • 8mm/Hi8/Digital8: $30 per tape<br>
        • MiniDV: $20 per tape<br>
        • Film reels (8mm/16mm): $40-80 per reel<br><br>
        Includes professional digital cleanup and your choice of DVD or digital file delivery. What type of tapes do you have?`;
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('project')) {
        return `📦 I can check your order status! I'll need one of the following:<br><br>
        • Your order number (e.g., #12345)<br>
        • Email address used for the order<br>
        • Last name + phone number<br><br>
        <em>Note: This demo shows simulated data. In production, I instantly access your Airtable database to provide real-time project updates, estimated completion dates, and tracking information.</em>`;
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('turnaround')) {
        return `⏱️ <strong>Current Turnaround Times:</strong><br><br>
        • Photos: 5-7 business days<br>
        • Videos: 10-14 business days<br>
        • Large projects (1000+ items): 3-4 weeks<br>
        • Rush service available: +50% fee, 2-3 days<br><br>
        These are live estimates based on our current production queue. Would you like to add rush processing to your order?`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        return `💰 I can provide instant pricing! Tell me more about your project:<br><br>
        • What type of media? (photos, videos, slides, film, etc.)<br>
        • Approximately how many items?<br>
        • Any special requirements or rush timing?<br><br>
        I'll calculate a custom quote with our current pricing and any applicable bulk discounts!`;
    }
    
    if (lowerMessage.includes('rush') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
        return `🚀 <strong>Rush Service Available!</strong><br><br>
        • 2-3 day turnaround for +50% fee<br>
        • Priority processing in our lab<br>
        • Direct project manager contact<br>
        • Weekend processing available<br><br>
        Perfect for wedding memories, memorial services, or time-sensitive projects. What's your deadline?`;
    }
    
    // Default response
    return `Hi! I'm Helena, your Heritagebox assistant. 💝 I'm here to help preserve your precious memories! I can assist with:<br><br>
    📸 Photo & slide scanning<br>
    🎬 Video & film transfer<br>
    💰 Instant pricing & quotes<br>
    📦 Order status & tracking<br>
    ⏱️ Current turnaround times<br>
    🚀 Rush service options<br><br>
    What specific information can I help you with today?`;
}

// Request human handoff
async function requestHuman() {
    try {
        const response = await fetch('/api/request-human', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                messages: conversationHistory,
                sessionId: sessionId
            })
        });
        
        if (response.ok) {
            addMessage(`I've connected you with our human support team! 👨‍💼<br><br>A specialist will review our conversation and respond within 15 minutes during business hours.<br><br>You'll receive updates via email, and I'll still be here if you have any other questions!`, 'bot');
        } else {
            throw new Error('Failed to request human support');
        }
    } catch (error) {
        console.error('Human handoff error:', error);
        addMessage(`I'm having trouble connecting you with our team right now. Please call us directly at <strong>(555) 123-4567</strong> or email <strong>support@heritagebox.com</strong> for immediate assistance!`, 'bot');
    }
}

// Auto-scroll to bottom when new messages arrive
const observer = new MutationObserver(() => {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

observer.observe(document.getElementById('chatMessages'), {
    childList: true,
    subtree: true
});

// Session cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (conversationHistory.length > 0) {
        // Save conversation state if needed
        localStorage.setItem(`chat_${sessionId}`, JSON.stringify({
            history: conversationHistory,
            timestamp: new Date()
        }));
    }
});

// Load previous session if exists (optional)
window.addEventListener('load', () => {
    const savedSession = localStorage.getItem(`chat_${sessionId}`);
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            const sessionAge = new Date() - new Date(session.timestamp);
            
            // Only restore if less than 1 hour old
            if (sessionAge < 60 * 60 * 1000) {
                conversationHistory = session.history;
                
                // Optionally restore chat messages
                session.history.forEach(msg => {
                    if (msg.sender !== 'user') { // Don't duplicate user messages
                        addMessage(msg.content, msg.sender === 'assistant' ? 'bot' : msg.sender);
                    }
                });
            }
        } catch (error) {
            console.error('Session restore error:', error);
        }
    }
});
