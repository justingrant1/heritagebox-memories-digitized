// Simple debug endpoint to test API connectivity
export default async function handler(request: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    const debugInfo: any = {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        environment: {
            CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'SET (' + process.env.CLAUDE_API_KEY.length + ' chars)' : 'NOT SET',
            AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? 'SET (' + process.env.AIRTABLE_API_KEY.length + ' chars)' : 'NOT SET',
            AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? 'SET (' + process.env.AIRTABLE_BASE_ID.length + ' chars)' : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'undefined'
        },
        message: 'Debug endpoint is working! API connectivity successful.',
        success: true
    };

    // Test if we can make a simple request
    try {
        const testResponse = await fetch('https://httpbin.org/json');
        const testData = await testResponse.json();
        debugInfo.networkTest = {
            success: true,
            testUrl: 'https://httpbin.org/json',
            responseReceived: !!testData
        };
    } catch (error: any) {
        debugInfo.networkTest = {
            success: false,
            error: error.message
        };
    }

    return new Response(JSON.stringify(debugInfo, null, 2), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}
