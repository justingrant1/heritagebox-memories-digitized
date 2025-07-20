# 🎞️ Heritagebox Claude AI + Airtable Chatbot
## Complete Deployment Guide

Your professional chatbot is ready for deployment! Here's everything you need to get it running.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd chatbot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `CLAUDE_API_KEY` - Your Anthropic Claude API key
- `AIRTABLE_API_KEY` - Your Airtable personal access token
- `AIRTABLE_BASE_ID` - Your Heritagebox Airtable base ID
- `PORT` - Server port (default: 3000)

### 3. Start the Server
```bash
npm start
```

Visit `http://localhost:3000` to see your chatbot in action!

## 🎯 Features Implemented

### Smart Conversation AI
- **Helena AI Assistant**: Professional, empathetic personality
- **Context Awareness**: Remembers conversation history
- **Intent Recognition**: Automatically detects customer needs
- **Business Intelligence**: Identifies high-value leads and urgent requests

### Airtable Integration
- **Real-time Data**: Connects to your existing customer/order database
- **Order Tracking**: Instant status updates from live data
- **Lead Capture**: Automatically saves conversations and contact info
- **Quote Generation**: Dynamic pricing with bulk discounts

### Advanced Features
- **Session Management**: Maintains conversation context
- **Structured Responses**: Visual quote cards and status updates
- **Dynamic Quick Actions**: Contextual suggestions based on conversation
- **Human Handoff**: Seamless escalation to your team
- **Mobile Responsive**: Works perfectly on all devices

## 🗃️ Airtable Setup

Your chatbot expects these tables in your Airtable base:

### Tables Required:
1. **Customers** (`tblUS7uf11axEmL56`)
   - Name, Email, Phone, Notes, Status, Assignee

2. **Products** (`tblJ0hgzvDXWgQGmK`)
   - Service Name, Price, Description, SKU

3. **Orders** (`tblTq25QawVDHTTkV`)
   - Order Number, Customer, Status, Items, Estimated Completion

4. **Order Items** (`tblgV4XGeQE3VL9CW`)
   - Order, Product, Quantity, Unit Price

5. **Chat Transcripts** (`tbl6gHHlvSwx4gQpB`)
   - Session ID, Transcript, Status, Customer Email

### Sample Data Setup:
The system includes realistic demo data that will work even without real Airtable connections.

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from chatbot directory
cd chatbot
vercel --prod
```

Add environment variables in Vercel dashboard.

### Option 2: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Option 3: Render/Heroku
1. Create new web service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

## 🔧 Customization

### Branding
Edit these files to match your brand:
- `style.css`: Colors, fonts, styling
- `index.html`: Company name, messaging
- `services/claudeService.js`: AI personality and responses

### Business Logic
- `services/airtableService.js`: Data operations and pricing
- `services/claudeService.js`: Conversation intelligence
- `server.js`: API endpoints and routing

## 📊 Analytics & Monitoring

### Conversation Tracking
All conversations are automatically logged to:
- Airtable Chat Transcripts table
- Server console logs
- Optional: Google Analytics events

### Lead Intelligence
The system automatically identifies and flags:
- High-value prospects (large projects, commercial clients)
- Urgent requests requiring immediate attention
- Contact information extraction
- Service interest patterns

### Performance Monitoring
Monitor these key metrics:
- Response time (should be <2 seconds)
- API error rates
- Session completion rates
- Lead conversion tracking

## 🎨 Widget Integration

### Embed on Your Website
Add this code to any page where you want the chat widget:

```html
<!-- Heritagebox Chat Widget -->
<script>
  // Load the widget
  (function() {
    var widget = document.createElement('div');
    widget.innerHTML = `
      <div class="chat-widget">
        <button class="chat-toggle" onclick="toggleHeritageboxChat()">💬</button>
        <iframe id="heritagebox-chat" src="https://your-chatbot-domain.com" 
                style="display:none; position:fixed; bottom:80px; right:20px; 
                       width:380px; height:550px; border:none; border-radius:20px; 
                       box-shadow:0 20px 60px rgba(0,0,0,0.2); z-index:1000;">
        </iframe>
      </div>
    `;
    document.body.appendChild(widget);
    
    window.toggleHeritageboxChat = function() {
      var iframe = document.getElementById('heritagebox-chat');
      iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
    };
  })();
</script>

<!-- Widget Styles -->
<style>
  .chat-widget .chat-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    z-index: 1001;
  }
</style>
```

### React Component
```jsx
import React, { useState } from 'react';

const HeritageboxChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-15 h-15 rounded-full 
                   bg-gradient-to-br from-blue-500 to-purple-600 
                   text-white text-2xl shadow-lg hover:shadow-xl 
                   transition-all duration-300 z-50"
      >
        {isOpen ? '✕' : '💬'}
      </button>
      
      {isOpen && (
        <iframe
          src="https://your-chatbot-domain.com"
          className="fixed bottom-20 right-5 w-96 h-[550px] 
                     border-none rounded-2xl shadow-2xl z-40"
          title="Heritagebox Chat Assistant"
        />
      )}
    </>
  );
};
```

## 🛠️ API Endpoints

Your chatbot provides these REST endpoints:

- `POST /api/chat` - Main chat interface
- `POST /api/quotes/generate` - Generate detailed quotes
- `GET /api/orders/status/:identifier` - Order lookup
- `GET /api/services` - Service catalog
- `POST /api/request-human` - Human handoff
- `GET /api/health` - Health check

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **CORS**: Configure for your specific domains in production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Sanitization**: Validate all user inputs
5. **HTTPS**: Always use SSL certificates in production

## 📈 Advanced Features

### MCP Server Integration (Optional)
For enterprise deployments, connect MCP servers for:
- Enhanced Airtable operations
- Slack notifications
- Advanced analytics
- Third-party integrations

### Multi-language Support
Extend the Claude service to support multiple languages:
```javascript
// In claudeService.js
const language = session.customerInfo.language || 'en';
const localizedPrompt = getLocalizedPrompt(language);
```

### A/B Testing
Test different AI personalities and conversation flows:
```javascript
// Randomly assign conversation styles
const variant = Math.random() > 0.5 ? 'formal' : 'casual';
const systemPrompt = buildSystemPrompt(variant);
```

## 🚨 Troubleshooting

### Common Issues:

**Chat not responding**
- Check Claude API key validity
- Verify Airtable permissions
- Check server logs for errors

**Slow responses**
- Monitor API response times
- Check network connectivity
- Consider adding response caching

**Session issues**
- Clear browser localStorage
- Restart the server
- Check sessionId generation

## 📞 Support

For deployment assistance or customization:
- Email: dev@heritagebox.com
- Documentation: [Your internal docs]
- Emergency: [Your emergency contact]

---

## 🎉 Congratulations!

Your professional Claude AI + Airtable chatbot is ready to:
- Handle customer inquiries 24/7
- Generate instant quotes
- Track order status
- Capture high-value leads
- Provide seamless customer experience

Deploy it today and watch your customer satisfaction soar! 🚀
