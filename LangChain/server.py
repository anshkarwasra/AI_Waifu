from flask import Flask 
from flask_socketio import SocketIO,send,emit
from TTS import stream_kokoro_audio
from LLM import Waifu

app = Flask(__name__)

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://localhost:5173",
        "file://",
    ],
)

waifu = None

@socketio.on('connect')
def handleConnect(auth):
    global waifu
    print(auth['personality'])
    if (auth['personality']):
        waifu = Waifu('kokoro',None,auth['personality'])
        print('waifu initialized')
  




@socketio.on("speak")
def handle_speak(data):
    if (not waifu):
        return {
            'msg':'model not initialized Connection error'
        }
    text = data["text"]
    
    if text == None:
        print('got the None Text returning')
        return
    if(waifu != None):
        res = waifu.interact(text)
        for audio_bytes in stream_kokoro_audio(res.dialouge):
            emit('audioStream',audio_bytes,binary=True)
        emit('waifuMetaData',res)
        
    



if __name__ == '__main__':
    socketio.run(app)