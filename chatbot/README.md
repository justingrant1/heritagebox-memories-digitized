# 🎞️ Heritagebox AI Chatbot

A professional customer service chatbot that combines Claude AI with Airtable data to provide intelligent responses for Heritagebox media digitization services.

## ✨ Features

- **Claude AI Integration**: Natural conversation powered by Claude 3 Sonnet
- **Airtable Database**: Real-time access to customer orders, pricing, and project data
- **Modern UI**: Responsive chat widget with smooth animations
- **Order Status**: Instant lookup of customer projects and status updates
- **Smart Pricing**: Dynamic quotes based on current pricing data
- **Fallback Responses**: Graceful degradation when APIs are unavailable

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ 
- Claude AI API key (from Anthropic)
- Airtable account with API access

### Installation

1. **Clone or download** this chatbot directory
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   CLAUDE_API_KEY=sk-ant-api03-...
   AIRTABLE_API_KEY=pat...
   AIRTABLE_BASE_ID=app...
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

## 🗄️ Airtable Setup

Your Airtable base should have these tables with the following fields:

### Orders Table
- `Order Number` (Text)
- `Customer Name` (Text)
- `Customer Email` (Email)
- `Status` (Single Select: Active, In Progress, Completed, etc.)
- `Estimated Completion` (Date)
- `Item Count` (Number)
- `Service Type` (Single Select: Photos, Videos, Slides, etc.)

### Pricing Table (Optional)
- `Service` (Text)
- `Price` (Currency)
- `Unit` (Text)

## 🔑 API Keys Setup

### Claude AI API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)

### Airtable API Key
1. Visit [Airtable Account](https://airtable.com/account)
2. Go to Developer Hub
3. Create a Personal Access Token
4. Copy the token (starts with `pat`)
5. Get your Base ID from the base URL (starts with `app`)

## 🎨 Customization

### Styling
Edit `style.css` to match your brand colors:
```css
.chat-toggle {
    background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

### Responses
Modify the Claude prompt in `server.js`:
```javascript
content: `You are a helpful assistant for [YOUR COMPANY]...`
```

### Branding
Update company information in:
- `index.html` - Page title and demo content
- `server.js` - Company details in Claude prompt

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the chatbot directory
3. Add environment variables in Vercel dashboard

### Railway
1. Connect your repository to Railway
2. Set environment variables
3. Deploy automatically

### Traditional Hosting
1. Upload files to your server
2. Install Node.js on server
3. Run `npm install && npm start`
4. Use PM2 for process management

## 🔗 Integration

### Embed on Website
Add this HTML where you want the chat widget:
```html
<script src="https://your-domain.com/script.js"></script>
<link rel="stylesheet" href="https://your-domain.com/style.css">
<div class="chat-widget">
    <!-- Chat widget HTML -->
</div>
```

### WordPress Plugin
Create a simple plugin that enqueues the chat scripts:
```php
wp_enqueue_script('heritagebox-chat', 'https://your-domain.com/script.js');
wp_enqueue_style('heritagebox-chat', 'https://your-domain.com/style.css');
```

## 📊 Analytics & Monitoring

### Built-in Health Check
- `GET /api/health` - Server status endpoint

### Recommended Monitoring
- **Uptime**: UptimeRobot or Pingdom
- **Analytics**: Google Analytics events
- **Errors**: Sentry integration
- **Performance**: New Relic APM

## 🛡️ Security

### Environment Variables
- Never commit `.env` files
- Use different keys for staging/production
- Rotate API keys regularly

### Rate Limiting
Consider adding rate limiting:
```javascript
const rateLimit = require('express-rate-limit');
app.use('/api/chat', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
}));
```

## 🔧 Troubleshooting

### Common Issues

**Chat not loading:**
- Check browser console for errors
- Verify server is running on correct port
- Check CORS settings

**API errors:**
- Verify API keys are correct
- Check Airtable base ID and table names
- Monitor API rate limits

**Styling issues:**
- Check CSS file path
- Verify mobile responsiveness
- Test in different browsers

### Debug Mode
Set `NODE_ENV=development` for detailed error logs.

## 📝 License

MIT License - feel free to customize for your needs!

## 🤝 Support

For issues or questions:
- Create an issue in this repository
- Email: support@heritagebox.com
- Phone: (555) 123-4567

---

Made with ❤️ for Heritagebox customers
