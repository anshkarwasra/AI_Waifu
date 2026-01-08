import PCMPlayer from 'pcm-player';
let player: PCMPlayer | null = null;

export const getPlayer = () => {
  
  if (!player) {
    player = new PCMPlayer({
      inputCodec: 'Int16',
      channels: 1,
      sampleRate: 24000,
      flushTime: 500,
      fftSize: 1024 // Most PCM players use 1024 or 2048 as default for visualizers
    });
  }
  return player;
};

export const unlockAudio = async () => {
  const p = getPlayer();
  // This is the magic line that satisfies the browser
  if (p.audioCtx && p.audioCtx.state === 'suspended') {
    await p.audioCtx.resume();
    console.log("Audio Companion Awakened!");
  }
};