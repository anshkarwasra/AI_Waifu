// types.ts


// ============= VRM & Rendering =============
export interface VRMProps {
    animation: string;
    getTargetLip: () => number;
}

// ============= Waifu Initialization =============
export interface WaifuInitState {
    personality: string;
    name?: string;
    voicePreset?: string;
}

// ============= Frontend State (UI/Animation Only) =============
export interface WaifuState {
    // Visual/Animation state
    vrmProps: VRMProps;
    currentAnimation: string; // Body animation (idle, wave, etc.)
    currentExpression: Expression; // Face expression
    
    // Speech state (for UI feedback)
    currentDialogue: string;
    isListening: boolean;
    isSpeaking: boolean;
    
    // Emotional state (driven by backend)
    mood: Mood;
    moodIntensity: number; // 0-1
    
    // Separate queues for independent control
    animationQueue: BodyAnimationEvent[];
    expressionQueue: ExpressionEvent[];
}

// ============= Body Animation Events =============
export interface BodyAnimationEvent {
    animationName: string; // e.g., "HappyIdle", "Wave", "Thinking"
    duration?: number; // How long to play (ms), undefined = loop
    loop?: boolean; // Should this animation loop?
    transitionDuration?: number; // Blend time between animations (ms)
    priority?: number; // Higher priority interrupts lower
}

// ============= Expression Events =============
export interface ExpressionEvent {
    expression: Expression;
    intensity?: number; // 0-1, blend multiple expressions
    duration?: number; // How long to hold (ms), undefined = until next
    blendDuration?: number; // Time to transition to this expression (ms)
}

// ============= User Input (Sent to Backend) =============
export interface UserInput {
    type: InteractionType;
    content?: string;
    timestamp: number;
    sessionId: string;
}

// ============= Backend Response (Commands for Frontend) =============
export interface WaifuResponse {
    // Speech output
    dialogue: string;
    audioStream?: boolean;
    
    // Visual commands (both can be specified independently)
    bodyAnimation?: BodyAnimationEvent;
    expression?: ExpressionEvent;
    
    // Mood state
    mood: Mood;
    moodIntensity: number;
    
    // Timing/coordination
    estimatedSpeechDuration?: number; // For planning animations
    
    // Metadata
    metadata?: {
        emotionAnalysis?: string;
        contextUsed?: number;
    };
}

// ============= Enums =============
export enum Expression {
    NEUTRAL = 'neutral',
    HAPPY = 'happy',
    SAD = 'sad',
    ANGRY = 'angry',
    SURPRISED = 'surprised',
    THINKING = 'thinking',
    SHY = 'shy',
    EXCITED = 'excited',
    CONFUSED = 'confused',
    BLUSHING = 'blushing',
}

export enum Mood {
    HAPPY = 'happy',
    SAD = 'sad',
    EXCITED = 'excited',
    BORED = 'bored',
    ANXIOUS = 'anxious',
    CALM = 'calm',
    PLAYFUL = 'playful',
    CURIOUS = 'curious',
}

export enum InteractionType {
    VOICE_INPUT = 'voice_input',
    TEXT_INPUT = 'text_input',
    IDLE_TIMEOUT = 'idle_timeout',
}

// ============= WebSocket Events =============
export interface WaifuSocketEvents {

    // Client -> Server (Send Event)
    'user_input': UserInput;
    'init_session': WaifuInitState;
    'user_started_speaking': { timestamp: number };
    'user_stopped_speaking': { timestamp: number };
    
    // Server -> Client(Recieve Event)
    'waifu_response': WaifuResponse;
    'tts_audio_chunk': ArrayBuffer;
    
    // Real-time updates (can be sent independently)
    'body_animation_update': BodyAnimationEvent;
    'expression_update': ExpressionEvent;
    'mood_shift': { mood: Mood; intensity: number };
}

// ============= Queue Manager Helpers =============
export interface QueueManager<T> {
    queue: T[];
    current: T | null;
    add: (event: T) => void;
    next: () => T | null;
    clear: () => void;
    peek: () => T | null;
}


