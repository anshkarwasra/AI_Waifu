// audioManager.ts - Create this new file

class AudioStreamPlayer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private gainNode: GainNode | null = null;
    private sourceQueue: AudioBufferSourceNode[] = [];
    private nextStartTime: number = 0;
    private dataArray: Uint8Array | null = null;
    private sampleRate: number = 24000; // Kokoro's sample rate

    constructor() {
        this.initAudioContext();
    }

    private initAudioContext() {
        // Create audio context (user interaction needed to start)
        this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
        
        // Create analyzer node for lip sync
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; // Small FFT for faster analysis
        this.analyser.smoothingTimeConstant = 0.3;
        
        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;
        
        // Connect: gain -> analyser -> destination
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        // Prepare data array for analysis
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    async feed(audioBuffer: ArrayBuffer) {
        if (!this.audioContext || !this.gainNode) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Convert Int16 PCM to Float32 for Web Audio API
        const int16Array = new Int16Array(audioBuffer);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0; // Normalize to -1.0 to 1.0
        }

        // Create audio buffer
        const audioBufferObj = this.audioContext.createBuffer(
            1, // mono
            float32Array.length,
            this.sampleRate
        );
        audioBufferObj.getChannelData(0).set(float32Array);

        // Create source and schedule it
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBufferObj;
        source.connect(this.gainNode);

        // Schedule playback
        const currentTime = this.audioContext.currentTime;
        const startTime = Math.max(currentTime, this.nextStartTime);
        
        source.start(startTime);
        this.nextStartTime = startTime + audioBufferObj.duration;

        // Cleanup when done
        source.onended = () => {
            source.disconnect();
            const index = this.sourceQueue.indexOf(source);
            if (index > -1) {
                this.sourceQueue.splice(index, 1);
            }
        };

        this.sourceQueue.push(source);
    }

    // This is the KEY method - call this every frame to get current audio level
    getCurrentAmplitude(): number {
        if (!this.analyser || !this.dataArray) return 0;

        // Get current frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate average amplitude (RMS-like)
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;

        // Normalize to 0-1 range (Uint8Array max is 255)
        return average / 255;
    }

    stop() {
        this.sourceQueue.forEach(source => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Already stopped
            }
        });
        this.sourceQueue = [];
        this.nextStartTime = 0;
    }

    async resume() {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// Singleton instance
let playerInstance: AudioStreamPlayer | null = null;

export function getPlayer(): AudioStreamPlayer {
    if (!playerInstance) {
        playerInstance = new AudioStreamPlayer();
    }
    return playerInstance;
}