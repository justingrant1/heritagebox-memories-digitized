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
        logEvent('method_not_allowed', {method: request.method});
        return new Response(JSON.stringify({success: false, error: 'Method not allowed'}), {
            status: 405,
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        const body = await request.json();
        logEvent('request_body_parsed', {
            hasToken: !!body.token,
            amount: body.amount,
            orderDetails: body.orderDetails
        });

        const {token, amount, orderDetails} = body;

        if (!token || !amount) {
            logEvent('validation_failed', {
                missingToken: !token,
                missingAmount: !amount
            });
            return new Response(JSON.stringify({success: false, error: 'Missing required fields'}), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
        const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
        const SQUARE_API_URL = process.env.SQUARE_API_URL;

        logEvent('environment_check', {
            hasAccessToken: !!squareAccessToken,
            hasLocationId: !!SQUARE_LOCATION_ID,
            hasApiUrl: !!SQUARE_API_URL,
            nodeEnv: process.env.NODE_ENV
        });

        if (!squareAccessToken) {
            logEvent('configuration_error', {error: 'SQUARE_ACCESS_TOKEN not configured'});
            return new Response(JSON.stringify({success: false, error: 'Payment service not configured - missing access token'}), {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            });
        }

        if (!SQUARE_LOCATION_ID) {
            logEvent('configuration_error', {error: 'SQUARE_LOCATION_ID not configured'});
            return new Response(JSON.stringify({success: false, error: 'Payment service not configured - missing location ID'}), {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            });
        }

        if (!SQUARE_API_URL) {
            logEvent('configuration_error', {error: 'SQUARE_API_URL not configured'});
            return new Response(JSON.stringify({success: false, error: 'Payment service not configured - missing API URL'}), {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            });
        }

        logEvent('square_payment_initiated', {
            amount,
            locationId: SQUARE_LOCATION_ID,
            environment: process.env.NODE_ENV,
            customerEmail: orderDetails?.customerInfo?.email,
            packageType: orderDetails?.package
        });

        let customerId = null;
        let orderId = null;

        // Step 1: Create or find customer
        if (orderDetails?.customerInfo) {
            const customerInfo = orderDetails.customerInfo;
            
            logEvent('creating_customer', { email: customerInfo.email });
            
            // First, try to find existing customer by email
            const searchCustomerResponse = await fetch(`${SQUARE_API_URL}/v2/customers/search`, {
                method: 'POST',
                headers: {
                    'Square-Version': '2024-02-15',
                    'Authorization': `Bearer ${squareAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filter: {
                        email_address: {
                            exact: customerInfo.email
                        }
                    }
                })
            });

            const searchResult = await searchCustomerResponse.json();
            
            if (searchResult.customers && searchResult.customers.length > 0) {
                customerId = searchResult.customers[0].id;
                logEvent('existing_customer_found', { customerId });
            } else {
                // Create new customer
                const createCustomerResponse = await fetch(`${SQUARE_API_URL}/v2/customers`, {
                    method: 'POST',
                    headers: {
                        'Square-Version': '2024-02-15',
                        'Authorization': `Bearer ${squareAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        given_name: customerInfo.firstName,
                        family_name: customerInfo.lastName,
                        email_address: customerInfo.email,
                        phone_number: customerInfo.phone,
                        address: {
                            address_line_1: customerInfo.address,
                            locality: customerInfo.city,
                            administrative_district_level_1: customerInfo.state,
                            postal_code: customerInfo.zipCode,
                            country: 'US'
                        }
                    })
                });

                const customerResult = await createCustomerResponse.json();
                
                if (customerResult.customer) {
                    customerId = customerResult.customer.id;
                    logEvent('new_customer_created', { customerId });
                } else {
                    logEvent('customer_creation_failed', { errors: customerResult.errors });
                }
            }
        }

        // Step 2: Create order with line items
        if (orderDetails) {
            const lineItems: any[] = [];
            
            // Add main package as line item
            lineItems.push({
                name: `${orderDetails.package} Package`,
                quantity: "1",
                base_price_money: {
                    amount: Math.round((orderDetails.packagePrice || amount) * 100),
                    currency: "USD"
                }
            });

            // Add USB drives if selected
            if (orderDetails.usbDrives && orderDetails.usbDrives > 0) {
                lineItems.push({
                    name: "Custom USB Drive",
                    quantity: orderDetails.usbDrives.toString(),
                    base_price_money: {
                        amount: 2495, // $24.95 in cents
                        currency: "USD"
                    }
                });
            }

            // Add digitizing speed upgrade if not standard
            if (orderDetails.digitizingSpeed && orderDetails.digitizingSpeed !== 'standard') {
                const speedPrices: { [key: string]: number } = {
                    expedited: 2999, // $29.99 in cents
                    rush: 6499 // $64.99 in cents
                };
                
                if (speedPrices[orderDetails.digitizingSpeed]) {
                    lineItems.push({
                        name: `${orderDetails.digitizingSpeed.charAt(0).toUpperCase() + orderDetails.digitizingSpeed.slice(1)} Processing`,
                        quantity: "1",
                        base_price_money: {
                            amount: speedPrices[orderDetails.digitizingSpeed],
                            currency: "USD"
                        }
                    });
                }
            }

            logEvent('creating_order', { lineItemsCount: lineItems.length });

            const orderBody: any = {
                order: {
                    location_id: SQUARE_LOCATION_ID,
                    line_items: lineItems
                }
            };

            // Add fulfillment information if customer exists
            if (customerId && orderDetails.customerInfo) {
                orderBody.order.fulfillments = [{
                    type: "SHIPMENT",
                    state: "PROPOSED",
                    shipment_details: {
                        recipient: {
                            display_name: `${orderDetails.customerInfo.firstName || ''} ${orderDetails.customerInfo.lastName || ''}`.trim()
                        }
                    }
                }];
            }

            const createOrderResponse = await fetch(`${SQUARE_API_URL}/v2/orders`, {
                method: 'POST',
                headers: {
                    'Square-Version': '2024-02-15',
                    'Authorization': `Bearer ${squareAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderBody)
            });

            const orderResult = await createOrderResponse.json();
            
            if (orderResult.order) {
                orderId = orderResult.order.id;
                logEvent('order_created', { orderId });
            } else {
                logEvent('order_creation_failed', { errors: orderResult.errors });
            }
        }

        // Step 3: Process payment with customer and order information
        const paymentBody: any = {
            source_id: token,
            amount_money: {
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'USD'
            },
            location_id: SQUARE_LOCATION_ID,
            idempotency_key: crypto.randomUUID()
        };

        // Add customer and order IDs if they exist
        if (customerId) {
            paymentBody.customer_id = customerId;
        }
        if (orderId) {
            paymentBody.order_id = orderId;
        }

        logEvent('processing_payment_with_context', { 
            hasCustomerId: !!customerId, 
            hasOrderId: !!orderId 
        });

        const response = await fetch(`${SQUARE_API_URL}/v2/payments`, {
            method: 'POST',
            headers: {
                'Square-Version': '2024-02-15',
                'Authorization': `Bearer ${squareAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentBody)
        });

        const result = await response.json();
        logEvent('square_response_received', {
            status: response.status,
            ok: response.ok,
            hasErrors: !!result.errors,
            errorDetails: result.errors,
            fullResponse: result
        });

        if (!response.ok) {
            // Log more detailed error information
            logEvent('square_api_error', {
                status: response.status,
                errors: result.errors,
                fullErrorResponse: result
            });
            
            const errorMessage = result.errors?.[0]?.detail || result.errors?.[0]?.code || 'Payment failed';
            throw new Error(errorMessage);
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
            headers: {'Content-Type': 'application/json'}
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
            headers: {'Content-Type': 'application/json'}
        });
    }
}
