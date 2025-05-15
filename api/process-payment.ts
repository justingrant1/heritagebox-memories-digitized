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
  logEvent('request_received', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  if (request.method !== 'POST') {
    logEvent('method_not_allowed', { method: request.method });
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    logEvent('request_body_parsed', { 
      hasToken: !!body.token,
      amount: body.amount,
      orderDetails: body.orderDetails
    });

    const { token, amount, orderDetails } = body;

    if (!token || !amount) {
      logEvent('validation_failed', { 
        missingToken: !token,
        missingAmount: !amount
      });
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const squareAccessToken = process.env.NODE_ENV === 'production' 
      ? process.env.SQUARE_ACCESS_TOKEN 
      : 'EAAAl1PTt4PYjqbVyX9Ho6eLP156f3tAI8Zoj-KohYWMzZqQJf79Qyq7BkCznxd9';

    logEvent('square_payment_initiated', {
      amount,
      locationId: 'L6JKGA1KJ9W89',
      environment: process.env.NODE_ENV
    });

    const response = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-02-15',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: token,
        amount_money: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'USD'
        },
        location_id: 'L6JKGA1KJ9W89',
        idempotency_key: crypto.randomUUID()
      })
    });

    const result = await response.json();
    logEvent('square_response_received', {
      status: response.status,
      ok: response.ok,
      hasErrors: !!result.errors,
      errorDetails: result.errors
    });

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.detail || 'Payment failed');
    }

    logEvent('payment_successful', {
      paymentId: result.payment?.id,
      amount: result.payment?.amount_money?.amount,
      status: result.payment?.status
    });

    // Here you would typically:
    // 1. Save the order details to your database
    // 2. Send confirmation emails
    // 3. Update inventory
    // 4. etc.

    return new Response(JSON.stringify({
      success: true,
      payment: result.payment
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logEvent('payment_error', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 