import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getPlayer } from "../audioManager";

export function useWaifuSocket() {
    const socketRef = useRef<Socket | null>(null);
    const currentLipRef = useRef(0);
    const targetLipRef = useRef(0);
    const player = getPlayer();


    useEffect(() => {
        const socket = io("http://127.0.0.1:5000", {
            transports: ["websocket"],
        });
        socketRef.current = socket;


        let lastAudioTime = performance.now();
        socket.on("tts_audio_chunk", (chunk: ArrayBuffer) => {
            player.feed(chunk);
  
        });

        return () => {
            socket.disconnect();
            player.stop();
        }
    }, []);


    const getLipValue = () => {
        const currentAmplitude = player.getCurrentAmplitude();
        
        // Set target based on current audio (boost it for visibility)
        targetLipRef.current = Math.min(currentAmplitude * 8, 1.0);

        // Smooth transition to target (prevents jittery movement)
        currentLipRef.current += 
            (targetLipRef.current - currentLipRef.current) * 0.35;

        return currentLipRef.current;
    };
    return {
        getTargetLip:getLipValue,
        getSocket: () => socketRef.current,
    };

}