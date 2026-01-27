export function computeRMS(int16Chunk: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < int16Chunk.length; i++) {
    const v = int16Chunk[i] / 32768;
    sum += v * v;
  }
  return Math.sqrt(sum / int16Chunk.length);
}

let smoothed = 0;

export function smooth(value: number, alpha = 0.2) {
  smoothed = smoothed * (1 - alpha) + value * alpha;
  return smoothed;
}
