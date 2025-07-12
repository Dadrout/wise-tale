import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/${path}`;
  console.log(`[Proxy] ---> ${request.method} ${url}`);

  try {
    const headers = new Headers(request.headers);
    // The backend URL is internal, so we can remove the origin header
    headers.delete('origin');

    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    });
    
    console.log(`[Proxy] <--- ${response.status} ${response.statusText} FROM ${url}`);
    
    // Re-create headers for the response to the client
    const responseHeaders = new Headers(response.headers);
    // Add CORS headers to allow the client to access the response
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[Proxy] Error fetching ${url}:`, error);
    return NextResponse.json(
      {
        error: 'Proxy failed to connect to the backend service.',
        details: error.message,
      },
      { status: 502 }
    );
  }
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, path);
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 