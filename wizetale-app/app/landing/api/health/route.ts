export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'wisetale-landing',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
} 