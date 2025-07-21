
// Square Catalog Product Mapping
const SQUARE_CATALOG_MAPPING = {
  packages: {
    'Starter': 'GNQP4YZH57MGVR265N4QA7QH',
    'Popular': 'MXDI5KGKHQE2G7MVWPGJWZIS', 
    'Dusty Rose': 'GKIADSF5IJQEAAKCIL2WXZEK',
    'Eternal': 'X2N4DL3YZBKJYAICCVYMSJ6Y'
  },
  addons: {
    'Custom USB Drive': 'SMW4WXZUAE6E5L3FTS76NC7Y',
    'Online Gallery & Backup': 'YJ3AGBF7MRHW2QQ6KI5DMSPG'
  },
  services: {
    'expedited': '37LXAW3CQ7ONF7AGNCYDWRRT',
    'rush': 'HSMOF4CINCKHVWUPCEN5ZBOU'
  }
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
    // Ensure we always return JSON, even on errors
    try {
        console.log(`[${new Date().toISOString()}] Payment API called - Method: ${request.method}`);

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({success: false, error: 'Method not allowed'}), {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error(`[${new Date().toISOString()}] JSON parse error:`, parseError);
            return new Response(JSON.stringify({success: false, error: 'Invalid JSON in request body'}), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        const {token, amount} = body;
        console.log(`[${new Date().toISOString()}] Processing payment - Amount: $${amount}, Has token: ${!!token}`);

        if (!token || !amount) {
            return new Response(JSON.stringify({success: false, error: 'Missing required fields: token and amount'}), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // Check environment variables
        const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
        const squareLocationId = process.env.SQUARE_LOCATION_ID;
        const squareApiUrl = process.env.SQUARE_API_URL;

        console.log(`[${new Date().toISOString()}] Environment check - Access Token: ${!!squareAccessToken}, Location ID: ${!!squareLocationId}, API URL: ${!!squareApiUrl}`);

        if (!squareAccessToken || !squareLocationId || !squareApiUrl) {
            return new Response(JSON.stringify({
                success: false, 
                error: 'Payment service configuration error',
                details: {
                    hasToken: !!squareAccessToken,
                    hasLocationId: !!squareLocationId,
                    hasApiUrl: !!squareApiUrl
                }
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // Simple payment processing - just the basic payment without complex customer/order logic for now
        const idempotencyKey = `payment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        const paymentBody = {
            source_id: token,
            amount_money: {
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'USD'
            },
            location_id: squareLocationId,
            idempotency_key: idempotencyKey
        };

        console.log(`[${new Date().toISOString()}] Making Square API call with idempotency key: ${idempotencyKey}`);

        const squareResponse = await fetch(`${squareApiUrl}/v2/payments`, {
            method: 'POST',
            headers: {
                'Square-Version': '2024-02-15',
                'Authorization': `Bearer ${squareAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentBody)
        });

        console.log(`[${new Date().toISOString()}] Square API response status: ${squareResponse.status}`);

        let result;
        try {
            result = await squareResponse.json();
        } catch (jsonError) {
            console.error(`[${new Date().toISOString()}] Square API response JSON parse error:`, jsonError);
            return new Response(JSON.stringify({success: false, error: 'Invalid response from payment processor'}), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        if (!squareResponse.ok) {
            console.error(`[${new Date().toISOString()}] Square API error:`, result);
            const errorMessage = result.errors?.[0]?.detail || result.errors?.[0]?.code || 'Payment processing failed';
            
            return new Response(JSON.stringify({
                success: false, 
                error: errorMessage,
                squareError: result.errors
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        console.log(`[${new Date().toISOString()}] Payment successful - Payment ID: ${result.payment?.id}`);

        return new Response(JSON.stringify({
            success: true,
            payment: {
                id: result.payment?.id,
                status: result.payment?.status,
                amount: result.payment?.amount_money?.amount,
                currency: result.payment?.amount_money?.currency
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Unexpected error in payment handler:`, error);
        
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    }
}
