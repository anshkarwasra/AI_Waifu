export function useMicControl() {
    const startTalking = () => {
        window.electronAPI.startMic();
    };

    const stopTalking = () => {
        window.electronAPI.stopMic();
    };

    return { startTalking, stopTalking };
}