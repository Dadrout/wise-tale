import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://wisetale-backend-dev:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `${BACKEND_URL}/${path}`

  try {
    const body = await request.text()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

  try {
    // Forward Range header for video seeking
    const headers: HeadersInit = {
      'method': 'GET',
    }
    
    const rangeHeader = request.headers.get('Range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    // Handle different content types
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // For binary files (videos, audio, images), stream the response
    if (contentType.startsWith('video/') || contentType.startsWith('audio/') || contentType.startsWith('image/')) {
      // For video files, we need to stream properly to support Range requests
      if (contentType.startsWith('video/')) {
        const responseHeaders: HeadersInit = {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
        }
        
        // Forward important headers for video streaming
        const contentLength = response.headers.get('content-length')
        const contentRange = response.headers.get('content-range')
        const acceptRanges = response.headers.get('accept-ranges')
        
        if (contentLength) responseHeaders['Content-Length'] = contentLength
        if (contentRange) responseHeaders['Content-Range'] = contentRange
        if (acceptRanges) responseHeaders['Accept-Ranges'] = acceptRanges
        
        // Stream the video response
        return new NextResponse(response.body, {
          status: response.status,
          headers: responseHeaders,
        })
      } else {
        // For other binary files, use buffer as before
        const buffer = await response.arrayBuffer()
        
        return new NextResponse(buffer, {
          status: response.status,
          headers: {
            'Content-Type': contentType,
            'Content-Length': response.headers.get('content-length') || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      }
    } else {
      // For text/JSON responses
      const data = await response.text()
      
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  })
} 