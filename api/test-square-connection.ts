export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
    const squareLocationId = process.env.SQUARE_LOCATION_ID;
    const squareApiUrl = process.env.SQUARE_API_URL;

    try {
        // Test basic environment variables
        if (!squareAccessToken || !squareLocationId || !squareApiUrl) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing Square environment variables',
                details: {
                    hasAccessToken: !!squareAccessToken,
                    hasLocationId: !!squareLocationId,
                    hasApiUrl: !!squareApiUrl,
                    accessTokenLength: squareAccessToken?.length || 0
                }
            }), {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            });
        }

        // Test Square API connectivity with a simple location GET request
        const locationResponse = await fetch(`${squareApiUrl}/v2/locations/${squareLocationId}`, {
            method: 'GET',
            headers: {
                'Square-Version': '2024-02-15',
                'Authorization': `Bearer ${squareAccessToken}`,
                'Content-Type': 'application/json',
            }
        });

        const locationResult = await locationResponse.json();

        if (!locationResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Square API call failed',
                details: {
                    status: locationResponse.status,
                    statusText: locationResponse.statusText,
                    response: locationResult,
                    url: `${squareApiUrl}/v2/locations/${squareLocationId}`
                }
            }), {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Square API connection successful',
            location: {
                id: locationResult.location?.id,
                name: locationResult.location?.name,
                status: locationResult.location?.status
            },
            config: {
                apiUrl: squareApiUrl,
                locationId: squareLocationId,
                accessTokenPreview: `${squareAccessToken.substring(0, 10)}...`
            }
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Connection test failed',
            details: {
                message: error.message,
                name: error.name,
                stack: error.stack
            }
        }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
