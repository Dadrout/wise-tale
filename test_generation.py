#!/usr/bin/env python3
"""
Simple test script for the new video generation API
"""
import requests
import json
import time

API_BASE = "http://localhost:8000"

def test_video_generation():
    """Test the new video generation pipeline"""
    
    # Test data - no difficulty level anymore!
    test_request = {
        "subject": "history",
        "topic": "French Revolution",
        "user_id": 1,
        "persona": "narrator",
        "language": "en"
    }
    
    print("🚀 Testing new video generation API...")
    print(f"Request: {json.dumps(test_request, indent=2)}")
    
    try:
        # Make the generation request
        response = requests.post(
            f"{API_BASE}/api/v1/generate/",
            json=test_request,
            timeout=30
        )
        
        print(f"\n📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS! Video generation completed")
            print(f"📊 Response: {json.dumps(result, indent=2)}")
            
            # Check if we got all expected fields
            expected_fields = ["id", "video_url", "audio_url", "transcript", "images_used", "status"]
            missing_fields = [field for field in expected_fields if field not in result]
            
            if missing_fields:
                print(f"⚠️  Warning: Missing fields: {missing_fields}")
            else:
                print("✅ All expected fields present!")
                
            # Test status endpoint
            if "id" in result:
                print(f"\n🔍 Testing status endpoint for ID: {result['id']}")
                status_response = requests.get(f"{API_BASE}/api/v1/generate/status/{result['id']}")
                if status_response.status_code == 200:
                    print("✅ Status endpoint working!")
                    print(f"Status: {status_response.json()}")
                else:
                    print(f"❌ Status endpoint failed: {status_response.status_code}")
                    
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"Raw response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed! Make sure the API server is running on localhost:8000")
    except requests.exceptions.Timeout:
        print("⏱️ Request timed out - this is normal for video generation")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

def test_health():
    """Test if the API server is running"""
    try:
        response = requests.get(f"{API_BASE}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running!")
            return True
        else:
            print(f"⚠️ API server responded but with status: {response.status_code}")
            return False
    except:
        print("❌ API server is not accessible")
        return False

if __name__ == "__main__":
    print("🧪 WiseTale API Testing Script")
    print("=" * 50)
    
    # Test server health first
    if test_health():
        print()
        test_video_generation()
    else:
        print("\n💡 Tip: Run 'cd wisetale-api && python -m uvicorn app.main:app --reload' to start the server")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!") 