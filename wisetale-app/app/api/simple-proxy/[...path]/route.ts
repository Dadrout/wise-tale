import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://138.197.191.222:80'

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
    const response = await fetch(url, {
      method: 'GET',
    })

    // Handle different content types
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // For binary files (videos, audio, images), stream the response
    if (contentType.startsWith('video/') || contentType.startsWith('audio/') || contentType.startsWith('image/')) {
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 