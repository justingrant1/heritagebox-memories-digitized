import { SquareClient } from 'square';
import { SquareEnvironment } from 'square';

// Initialize Square client
const squareClient = new SquareClient({
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  token: process.env.NODE_ENV === 'production' 
    ? process.env.SQUARE_ACCESS_TOKEN 
    : 'EAAAl1PTt4PYjqbVyX9Ho6eLP156f3tAI8Zoj-KohYWMzZqQJf79Qyq7BkCznxd9'
});

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { token, amount, orderDetails } = await request.json();

    if (!token || !amount) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payment = await squareClient.payments.create({
      sourceId: token,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Convert to cents and use BigInt
        currency: 'USD'
      },
      locationId: 'L6JKGA1KJ9W89', //process.env.SQUARE_LOCATION_ID,
      idempotencyKey: crypto.randomUUID() // Generate a unique key for idempotency
    });

    // Here you would typically:
    // 1. Save the order details to your database
    // 2. Send confirmation emails
    // 3. Update inventory
    // 4. etc.

    return new Response(JSON.stringify({
      success: true,
      payment: payment.payment
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 