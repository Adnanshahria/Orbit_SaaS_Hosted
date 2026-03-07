const ALLOWED_ORIGINS = [
    'https://orbitsaas.cloud',
    'https://www.orbitsaas.cloud',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
];

/**
 * Build CORS response headers based on the request origin.
 */
export function getCorsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:');
    const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin',
    };
}

/**
 * Handle CORS preflight OPTIONS request.
 */
export function handleOptions(request: Request): Response {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
    });
}

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(
    data: unknown,
    request: Request,
    status = 200,
    extraHeaders: Record<string, string> = {}
): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request),
            ...extraHeaders,
        },
    });
}
