import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your Heritagebox AI assistant. I can help you with:
      
📸 Photo digitization pricing
🎬 Video transfer options  
📦 Project status updates
⏱️ Turnaround times

What would you like to know?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [humanHandoff, setHumanHandoff] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(message),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('scan')) {
      return `📸 **Photo Digitization Pricing:**

• Standard photos: $0.50 each
• Large photos (8x10+): $1.00 each  
• Slides/negatives: $0.75 each
• Bulk discounts available for 500+ items

All photos are scanned at 600 DPI with color correction included. Would you like me to create a custom quote for your collection?`;
    }
    
    if (lowerMessage.includes('video') || lowerMessage.includes('tape') || lowerMessage.includes('film')) {
      return `🎬 **Video Transfer Options:**

• VHS/VHS-C: $25 per tape
• 8mm/Hi8/Digital8: $30 per tape
• MiniDV: $20 per tape  
• Film reels (8mm/16mm): $40-80 per reel

Includes digital cleanup and DVD/digital file delivery. What type of tapes do you have?`;
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('project')) {
      return `📦 I can check your order status! I'll need either:

• Your order number
• Email address used for the order
• Last name + phone number

*Note: In the full system, I'd instantly access your Airtable database to provide live project updates, estimated completion dates, and tracking information.*`;
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('turnaround')) {
      return `⏱️ **Current Turnaround Times:**

• Photos: 5-7 business days
• Videos: 10-14 business days  
• Large projects (1000+ items): 3-4 weeks
• Rush service: +50% fee, 2-3 days

These are live estimates based on our current queue. Would you like rush processing?`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
      return `💰 I can provide instant pricing! Tell me more about your project:

• What type of media? (photos, videos, slides, etc.)
• Approximately how many items?
• Any special requirements?

I'll calculate a custom quote with our current pricing and any applicable discounts.`;
    }
    
    // Default response
    return `Thanks for your message! I'm here to help with all your media digitization needs. I can assist with:

📸 Photo & slide scanning
🎬 Video & film transfer  
💰 Pricing & quotes
📦 Order status & tracking
⏱️ Turnaround times

What specific information can I help you with today?`;
  };

  const sendQuickMessage = (message: string) => {
    sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue);
    }
  };

  const requestHumanHandoff = async () => {
    setHumanHandoff(true);
    const handoffMessage: Message = {
      id: Date.now().toString(),
      content: "Connecting you to a human agent. Please wait a moment...",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, handoffMessage]);

    try {
      await fetch('/api/request-human', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
    } catch (error) {
      console.error('Error requesting human handoff:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I was unable to connect you to a human agent at this time. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
        style={{ width: '60px', height: '60px' }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 max-sm:w-[calc(100vw-40px)] max-sm:right-[-10px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
                🎞️
              </div>
              <div>
                <h3 className="font-semibold">Heritagebox Assistant</h3>
                <p className="text-sm opacity-90">Here to help with your digitization needs</p>
              </div>
            </div>
            <button
              onClick={requestHumanHandoff}
              disabled={humanHandoff}
              className="text-xs bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded-full transition-colors"
            >
              Talk to Human
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Quick Actions - only show after first message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => sendQuickMessage('How much does photo scanning cost?')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200 transition-colors"
                >
                  Photo Pricing
                </button>
                <button
                  onClick={() => sendQuickMessage('Check my order status')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200 transition-colors"
                >
                  Order Status
                </button>
                <button
                  onClick={() => sendQuickMessage('Video transfer options')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200 transition-colors"
                >
                  Video Transfer
                </button>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="max-w-[85%] p-3 rounded-2xl bg-white shadow-sm rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-white border-t">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none text-sm"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatWidget;
