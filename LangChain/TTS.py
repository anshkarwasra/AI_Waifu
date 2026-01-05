from kokoro import KPipeline
import numpy as np
from logging import INFO


pipeline = KPipeline(lang_code='a')



def stream_kokoro_audio(text:str):
    generator = pipeline(text,voice='af_bella',speed=1,split_pattern=r'\n')
    for i,(gs,ps,audio_tensor ) in enumerate(generator):
        audio_np = audio_tensor.detach().cpu().numpy()
        print("sending the following packet :- ",audio_np)
        yield (audio_np * 32767).astype(np.int16).tobytes()