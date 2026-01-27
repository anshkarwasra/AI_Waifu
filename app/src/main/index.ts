import { app,  BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import recorder from "node-record-lpcm16"
import { io, Socket as ClientSocket } from 'socket.io-client'
import icon from '../../resources/icon.png?asset'
import { Readable } from 'stream';

// --- Global State ---
let micStream: Readable | null = null;
let inputSocket: ClientSocket | null = null;
let audioBufferChunks: Buffer[] = [];
let silenceTimer: NodeJS.Timeout | null = null;

// --- Config ---
const VOLUME_THRESHOLD = 30000;  // Adjust if it's too sensitive
const SILENCE_DURATION = 2000; // 1.5 seconds of silence triggers send

/**
 * Calculates volume to decide if we should keep the audio or discard as noise
 */
function getVolume(buffer: Buffer): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        if (i + 1 < buffer.length) {
            const int = buffer.readInt16LE(i);
            sum += int * int;
        }
    }
    return Math.sqrt(sum / (buffer.length / 2));
}

function setupMicSystem() {
  inputSocket = io("http://127.0.0.1:5000", {
    transports: ["websocket"],
    auth: { clientType: 'mic-streamer' }
  });

  const sendSentence = () => {
    if (audioBufferChunks.length === 0) return;

    console.log(`[Mic] Sentence finished. Sending ${audioBufferChunks.length} chunks to Backend.`);
    const fullSentenceBuffer = Buffer.concat(audioBufferChunks);
    
    if (inputSocket?.connected) {
      inputSocket.emit('audioInp', fullSentenceBuffer);
    }

    // Reset state
    audioBufferChunks = [];
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  };

  ipcMain.on('start-mic', () => {
    if (micStream) return;

    console.log('🎤 Smart Recording Started...');

    micStream = recorder.record({
      sampleRate: 16000,
      threshold: 0,
      recordProgram: 'sox',
      audioType: 'raw', // Crucial: no RIFF headers
    }).stream();

    micStream?.on('data', (chunk: Buffer) => {
      const volume = getVolume(chunk);
      console.log('the volume is :- ',volume)
      if (volume > VOLUME_THRESHOLD) {
        // User is speaking: reset timer and store audio
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        audioBufferChunks.push(chunk);
      } else {
        // Silence: if we have audio, start the "end of sentence" countdown
        if (audioBufferChunks.length > 0 && !silenceTimer) {
          silenceTimer = setTimeout(sendSentence, SILENCE_DURATION);
        }
      }
    });

    micStream?.on("error", (err) => console.log("Mic Error:", err));
  });

  ipcMain.on('stop-mic', () => {
    if (micStream) {
      console.log("Stopping Mic...");
      sendSentence(); // Final flush
      micStream.removeAllListeners('data');
      micStream = null;
    }
  });
}

// Standard Electron Window Logic...
function createWindow(): void {
  setupMicSystem();
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => { mainWindow.show() })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => { optimizer.watchWindowShortcuts(window) })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})