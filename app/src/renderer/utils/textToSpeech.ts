import PCMPlayer from 'pcm-player';




export const playStream = async (text: string) => {
    try {
        const player = new PCMPlayer({
            inputCodec: 'Int16',
            channels: 1,
            sampleRate: 24000,
            flushTime: 500,
            fftSize: 1024 // Most PCM players use 1024 or 2048 as default for visualizers
        });

        const res = await fetch('http://127.0.0.1:5000/TTS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: text })
        });

        if (res.body) {
            const reader = res.body.getReader();
            console.log('got the following reader ', reader)
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                console.log(value)
                player.feed(value.buffer);
            }
        }

    } catch (err) {
        console.error("streaming Error:- ", err)
    } finally {
        console.log("finished streaming")
    }

}