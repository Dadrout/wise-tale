import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://138.197.191.222:80'

export async function GET() {
  try {
    console.log('Testing backend connection...')
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WiseTale-Test/1.0',
      },
    })

    console.log('Backend response status:', response.status)
    const data = await response.text()
    console.log('Backend response:', data)

    return NextResponse.json({
      success: true,
      backend_status: response.status,
      backend_response: data,
      backend_url: BACKEND_URL,
    })
  } catch (error) {
    console.error('Test backend error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend_url: BACKEND_URL,
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('Testing backend POST...')
    
    const testData = {
      subject: "test",
      topic: "vercel test",
      level: "elementary",
      user_id: 999
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WiseTale-Test/1.0',
      },
      body: JSON.stringify(testData),
    })

    console.log('Backend POST response status:', response.status)
    const data = await response.text()
    console.log('Backend POST response:', data)

    return NextResponse.json({
      success: true,
      backend_status: response.status,
      backend_response: data,
      test_data: testData,
      backend_url: `${BACKEND_URL}/api/v1/tasks/generate`,
    })
  } catch (error) {
    console.error('Test backend POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend_url: `${BACKEND_URL}/api/v1/tasks/generate`,
    }, { status: 500 })
  }
} 