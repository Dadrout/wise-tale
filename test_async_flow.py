import asyncio
import websockets
import requests
import json
import time

API_URL = "http://localhost:8000/api/v1/generate"
WS_URL = "ws://localhost:8000/ws/status"

async def test_generation_flow():
    """
    Tests the full asynchronous video generation flow.
    1. Triggers the generation via HTTP POST.
    2. Connects to the WebSocket endpoint to monitor progress.
    3. Prints real-time status updates.
    4. Prints the final result.
    """
    print("🚀 Starting generation task...")
    
    # 1. Trigger the generation
    payload = {
        "subject": "History",
        "topic": "The first manned mission to the Moon",
        "user_id": 123
    }
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        task_id = response.json().get("task_id")
        if not task_id:
            print("❌ Failed to get task_id from response.")
            return
        print(f"✅ Task started with ID: {task_id}")
    except requests.exceptions.RequestException as e:
        print(f"❌ HTTP request failed: {e}")
        return

    # 2. Connect to WebSocket for status updates
    uri = f"{WS_URL}/{task_id}"
    print(f"📡 Connecting to WebSocket: {uri}")
    
    start_time = time.time()
    try:
        async with websockets.connect(uri) as websocket:
            while True:
                try:
                    message_str = await websocket.recv()
                    message = json.loads(message_str)
                    
                    status = message.get("status")
                    info = message.get("info", {})
                    details = info.get('status', '') if isinstance(info, dict) else info

                    print(f"[{time.time() - start_time:.2f}s] Received update: Status={status}, Details='{details}'")

                    if status in ["SUCCESS", "FAILURE"]:
                        print("\n🎉 Final Result:")
                        print(json.dumps(message, indent=2))
                        break
                except websockets.exceptions.ConnectionClosed:
                    print("🏁 WebSocket connection closed by server.")
                    break
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_generation_flow()) 