set -e

echo "🧪 Running environment regression tests..."

# Check API keys match
API_KEY=$(grep 'API_KEY=' .env | head -1 | cut -d= -f2)
NEXT_PUBLIC_API_KEY=$(grep 'NEXT_PUBLIC_API_KEY=' .env | head -1 | cut -d= -f2)

[[ "$API_KEY" == "$NEXT_PUBLIC_API_KEY" ]] || {
  echo "❌ API keys mismatch/missing"
  echo "API_KEY: ${API_KEY:0:10}..."
  echo "NEXT_PUBLIC_API_KEY: ${NEXT_PUBLIC_API_KEY:0:10}..."
  exit 1
}

echo "✅ API keys match"

# Test API endpoint
echo "🧪 Testing API endpoint..."
response=$(curl -s -w 'HTTPCODE:%{http_code}' \
  -X POST https://wizetale.com/api/v1/generate \
  -H 'Content-Type: application/json' \
  -H "X-API-KEY: $API_KEY" \
  -d '{"subject": "test", "topic": "test"}')

code=$(echo "$response" | grep -o 'HTTPCODE:[0-9]*' | cut -d: -f2)

[[ "$code" == "202" ]] || {
  echo "❌ API test failed - got HTTP $code"
  exit 1
}

echo "✅ API endpoint working (HTTP 202)"
echo "✅ All regression tests passed"
