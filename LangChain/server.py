
from gevent import monkey
monkey.patch_all()

from flask import Flask 
from flask_socketio import SocketIO, emit
from TTS import stream_kokoro_audio
from LLM import Waifu
import numpy as np
from faster_whisper import WhisperModel

app = Flask(__name__)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='gevent',
)

waifu = None
stt_model = WhisperModel("base.en", device="cuda", compute_type="float16")

@socketio.on('connect')
def handleConnect(auth):
    global waifu
    if auth and 'personality' in auth:
        print(f"🌸 Waifu UI Connected: {auth['personality']}")
        waifu = Waifu('kokoro', None, auth['personality'])
        return
    if auth and auth.get('clientType') == 'mic-streamer':
        print("🎤 Microphone Streamer Connected")
        return

@socketio.on('audioInp')
def handleAudioSentence(data):
    global waifu
    print(f"🎤 Received sentence buffer ({len(data)} bytes)")

    # 1. Convert Raw Bytes to Float32 for Whisper
    audio_int16 = np.frombuffer(data, dtype=np.int16)
    audio_float32 = audio_int16.astype(np.float32) / 32768.0

    # 2. Transcribe
    segments, _ = stt_model.transcribe(
        audio_float32, 
        beam_size=5, 
        vad_filter=True, 
        language="en"
    )
    
    full_text = " ".join([s.text for s in segments]).strip()
    
    if full_text and full_text not in [".", "You.", "you"]:
        print(f"✨ Waifu heard: {full_text}")
        
        # 3. Automatically trigger LLM interaction
        if waifu:
            # We call the speak logic directly here
            handle_speak({"text": full_text})
        else:
            print("⚠️ Transcription ready, but Waifu not initialized!")

@socketio.on("speak")
def handle_speak(data):
    global waifu
    text = data.get("text")
    if not text or not waifu:
        return

    print(f"🧠 Thinking: {text}")
    res = waifu.interact(text)
    
    # Send text metadata for UI/Lip Sync
    emit('waifuMetaData', res)

    # Stream the TTS audio chunks
    for audio_bytes in stream_kokoro_audio(res.dialouge):
        emit('audioStream', audio_bytes, binary=True)

if __name__ == '__main__':
    print("🚀 AI Waifu Backend is live on port 5000")
    socketio.run(app, host='0.0.0.0', port=5000)