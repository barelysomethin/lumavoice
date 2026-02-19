from http.server import HTTPServer
from api.tts import handler
import sys

# Windows compatibility for asyncio policy if needed (though edge-tts uses flexible loops)
import asyncio
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

PORT = 3001

print(f"Starting Local Python TTS Server on port {PORT}...")
print("This server acts as a local replacement for Vercel Serverless Functions.")
print("Press Ctrl+C to stop.")

try:
    httpd = HTTPServer(('', PORT), handler)
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
