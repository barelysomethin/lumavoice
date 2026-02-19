from http.server import BaseHTTPRequestHandler
import json
import asyncio
import edge_tts
import tempfile
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            text = body.get('text')
            voice = body.get('voice', 'en-US-AndrewNeural')
            
            if not text:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': "Invalid or missing 'text'"}).encode('utf-8'))
                return

            # Temporary file to store audio
            # Use gettempdir() for cross-platform compatibility (Vercel uses /tmp)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3', dir=tempfile.gettempdir()) as tmp_file:
                temp_filename = tmp_file.name

            async def generate_audio():
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(temp_filename)

            # Run async code
            asyncio.run(generate_audio())

            # Read the audio back
            with open(temp_filename, 'rb') as f:
                audio_data = f.read()

            # cleanup
            os.remove(temp_filename)

            self.send_response(200)
            self.send_header('Content-type', 'audio/mpeg')
            self.send_header('Content-Disposition', 'inline; filename="tts.mp3"')
            self.end_headers()
            self.wfile.write(audio_data)

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
