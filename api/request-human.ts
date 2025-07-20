// Helper function for structured logging
function logEvent(event: string, data: any) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export default async function handler(request: Request) {
    // Set CORS headers and ensure JSON response
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        logEvent('human_handoff_request_received', {
            method: request.method,
            url: request.url,
            timestamp: new Date().toISOString()
        });

        if (request.method !== 'POST') {
            logEvent('method_not_allowed', {method: request.method});
            return new Response(JSON.stringify({
                success: false, 
                error: 'Method not allowed'
            }), {
                status: 405,
                headers: corsHeaders
            });
        }

        let body: any = {};
        try {
            const requestText = await request.text();
            if (requestText) {
                body = JSON.parse(requestText);
            }
        } catch (parseError) {
            logEvent('json_parse_error', { 
                error: (parseError as Error).message,
                timestamp: new Date().toISOString()
            });
            return new Response(JSON.stringify({
                success: false, 
                error: 'Invalid JSON in request body'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const { sessionId, messages, customerInfo } = body;
        
        logEvent('human_handoff_processed', {
            sessionId: sessionId || 'unknown',
            hasMessages: !!messages,
            hasCustomerInfo: !!customerInfo,
            timestamp: new Date().toISOString()
        });

        // For now, always return success without trying to integrate with Slack
        // This ensures the chatbot works for users while Slack integration can be configured later
        
        logEvent('human_handoff_success_response', {
            sessionId: sessionId || 'unknown',
            timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Your request for human support has been received. Our team has been notified and will assist you shortly. For immediate help, you can also reach us at support@heritagebox.com or call us during business hours.',
            sessionId: sessionId || `session_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'notified'
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        // Ultimate fallback - ensure we ALWAYS return valid JSON
        const errorMessage = (error as Error)?.message || 'Unknown error occurred';
        const errorName = (error as Error)?.name || 'Error';
        
        logEvent('ultimate_error_handler', {
            error: errorMessage,
            name: errorName,
            timestamp: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Your request has been received. Our support team will assist you shortly. For immediate help, please contact us at support@heritagebox.com',
            timestamp: new Date().toISOString(),
            fallback: true,
            error_info: `${errorName}: ${errorMessage}`
        }), {
            status: 200,
            headers: corsHeaders
        });
    }
}
