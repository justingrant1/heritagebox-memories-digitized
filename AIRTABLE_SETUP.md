# Airtable Integration Setup Guide

## Overview
When customers place orders on your HeritageBox website, all their information will automatically be saved to your Airtable base. This includes customer details, order information, package selected, add-ons, and payment method.

## Setup Steps

### 1. Create Your Airtable Base
1. Go to [Airtable.com](https://airtable.com) and sign up/login
2. Create a new base called "HeritageBox Orders" (or any name you prefer)
3. Create a table called "Orders" with the following fields:

#### Required Fields for Your Airtable Table:
- **Customer Name** (Single line text)
- **First Name** (Single line text)  
- **Last Name** (Single line text)
- **Email** (Email)
- **Phone** (Phone number)
- **Address** (Single line text)
- **City** (Single line text)
- **State** (Single line text)
- **ZIP Code** (Single line text)
- **Full Address** (Long text)
- **Package** (Single line text)
- **Package Price** (Currency)
- **Package Features** (Long text)
- **Total Amount** (Currency)
- **Digitizing Speed** (Single line text)
- **Digitizing Time** (Single line text)
- **Digitizing Price** (Single line text)
- **Add Ons** (Long text)
- **Payment Method** (Single line text)
- **Order Date** (Single line text)
- **Timestamp** (Single line text)
- **Order Status** (Single select: New Order, Processing, Completed, etc.)
- **Processing Status** (Single select: Pending, In Progress, Shipped, etc.)

### 2. Get Your Airtable Credentials

#### API Key:
1. Go to [Airtable Account Settings](https://airtable.com/account)
2. In the API section, click "Generate API key"
3. Copy this key - this is your `VITE_AIRTABLE_API_KEY`

#### Base ID:
1. Go to [Airtable API Documentation](https://airtable.com/api)
2. Select your base
3. The Base ID is shown in the URL and in the introduction section
4. It looks like `appXXXXXXXXXXXXXX` - this is your `VITE_AIRTABLE_BASE_ID`

### 3. Configure Environment Variables
1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Airtable credentials:

```env
# Airtable Configuration
VITE_AIRTABLE_API_KEY=your_actual_api_key_here
VITE_AIRTABLE_BASE_ID=your_actual_base_id_here
VITE_AIRTABLE_TABLE_NAME=Orders
```

### 4. Test the Integration
1. Restart your development server: `npm run dev`
2. Place a test order on your website
3. Check your Airtable base - you should see a new record with all the customer and order information

## What Gets Saved to Airtable

For each order, the following information is automatically saved:

### Customer Information:
- Full name, first name, last name
- Email address and phone number
- Complete shipping address

### Order Details:
- Package selected (Starter, Popular, Dusty Rose, Eternal)
- Package price and features
- Digitizing speed (Standard, Expedited, Rush)
- Add-ons (USB drives, cloud backup)
- Total amount

### Order Metadata:
- Payment method (Credit Card details or PayPal)
- Order date and timestamp
- Order status (set to "New Order")
- Processing status (set to "Pending")

## Error Handling
- If Airtable is down or there's a connection issue, the checkout process will still complete successfully
- Errors are logged to the browser console for debugging
- The order will still be sent via email (Formspree) as a backup

## Security Notes
- Your Airtable API key is in the client-side code (environment variable)
- This is acceptable for this use case since it's only adding records, not exposing sensitive data
- For production, consider moving to a server-side integration if security is a concern

## Troubleshooting

### Common Issues:
1. **Records not appearing**: Check your API key and Base ID are correct
2. **Field errors**: Ensure all field names in Airtable match exactly (case-sensitive)
3. **Permission errors**: Make sure your API key has write permissions to the base

### Debug Steps:
1. Open browser developer tools (F12)
2. Look for Airtable success/error messages in the console
3. Check the Network tab for failed requests to Airtable API

## Next Steps
Once this is working, you can:
- Set up Airtable automations to send notifications when new orders arrive
- Create views to filter orders by status, package type, etc.
- Export order data for accounting or shipping purposes
- Set up Zapier integrations to connect to other tools
