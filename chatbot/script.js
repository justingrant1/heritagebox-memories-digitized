let chatOpen = false;

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
    input.value = '';
    
    // Show typing indicator
    showTyping();
    
    try {
        // Send message to backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTyping();
        
        // Add bot response
        addMessage(data.response, 'bot');
        
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
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    document.getElementById('typingIndicator').style.display = 'block';
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function hideTyping() {
    document.getElementById('typingIndicator').style.display = 'none';
}

// Fallback simulated responses for when the API is not available
function getSimulatedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('scan')) {
        return `📸 <strong>Photo Digitization Pricing:</strong><br><br>
        • Standard photos: $0.50 each<br>
        • Large photos (8x10+): $1.00 each<br>
        • Slides/negatives: $0.75 each<br>
        • Bulk discounts available for 500+ items<br><br>
        All photos are scanned at 600 DPI with color correction included. Would you like me to create a custom quote for your collection?`;
    }
    
    if (lowerMessage.includes('video') || lowerMessage.includes('tape') || lowerMessage.includes('film')) {
        return `🎬 <strong>Video Transfer Options:</strong><br><br>
        • VHS/VHS-C: $25 per tape<br>
        • 8mm/Hi8/Digital8: $30 per tape<br>
        • MiniDV: $20 per tape<br>
        • Film reels (8mm/16mm): $40-80 per reel<br><br>
        Includes digital cleanup and DVD/digital file delivery. What type of tapes do you have?`;
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('project')) {
        return `📦 I can check your order status! I'll need either:<br><br>
        • Your order number<br>
        • Email address used for the order<br>
        • Last name + phone number<br><br>
        <em>Note: This demo uses simulated data. In the real system, I'd instantly access your Airtable database to provide live project updates, estimated completion dates, and tracking information.</em>`;
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('turnaround')) {
        return `⏱️ <strong>Current Turnaround Times:</strong><br><br>
        • Photos: 5-7 business days<br>
        • Videos: 10-14 business days<br>
        • Large projects (1000+ items): 3-4 weeks<br>
        • Rush service: +50% fee, 2-3 days<br><br>
        These are live estimates based on our current queue. Would you like rush processing?`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        return `💰 I can provide instant pricing! Tell me more about your project:<br><br>
        • What type of media? (photos, videos, slides, etc.)<br>
        • Approximately how many items?<br>
        • Any special requirements?<br><br>
        I'll calculate a custom quote with our current pricing and any applicable discounts.`;
    }
    
    // Default response
    return `Thanks for your message! I'm here to help with all your media digitization needs. I can assist with:<br><br>
    📸 Photo & slide scanning<br>
    🎬 Video & film transfer<br>
    💰 Pricing & quotes<br>
    📦 Order status & tracking<br>
    ⏱️ Turnaround times<br><br>
    What specific information can I help you with today?`;
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
