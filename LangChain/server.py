from flask import Flask,request,Response
from flask_cors import CORS
from logging import INFO
from TTS import stream_kokoro_audio
import json

app = Flask(__name__)

CORS(app)

@app.route('/TTS',methods=['GET','POST'])
def tts():
    query = request.get_json()
    text = query.get('input','')

    return Response(stream_kokoro_audio(text),mimetype='application/octet-stream')




app.run(debug=True)
