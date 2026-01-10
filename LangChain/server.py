from flask import Flask 
from flask_socketio import SocketIO,send,emit
from TTS import stream_kokoro_audio


app = Flask(__name__)

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://localhost:5173",
        "file://",
    ],
)


@socketio.on('connect')
def handleConnect(auth):
    print('recieved the following params:- ',auth)



@socketio.on("speak")
def handle_speak(data):
    text = data["text"]
    
    if text == None:
        print('got the None Text returning')
        return
    for audio_bytes in stream_kokoro_audio(text):
        emit(
            "tts_audio_chunk",
            audio_bytes,
            binary=True,
        )

if __name__ == '__main__':
    socketio.run(app)