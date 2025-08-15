import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import xmlescape from 'xml-escape';

export async function POST(request) {
  try {
    const { text, voice = "en-US-AndrewNeural" } = await request.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid or missing 'text'" }), {
        status: 400,
      });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(xmlescape(text));
    const chunks = [];

    return new Promise((resolve, reject) => {
      audioStream.on("data", (chunk) => chunks.push(chunk));
      audioStream.on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        resolve(new Response(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `inline; filename="tts.mp3"`,
          },
        }));
      });
      audioStream.on("error", (error) => {
        console.error("❌ Stream Error:", error);
        reject(new Response(JSON.stringify({ error: "TTS streaming failed" }), {
          status: 500,
        }));
      });
    });
  } catch (error) {
    console.error("❌ TTS Error:", error);
    return new Response(JSON.stringify({ error: "TTS failed" }), {
      status: 500,
    });
  }
}
