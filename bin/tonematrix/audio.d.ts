import { Model } from "./model.js";
export declare class Audio {
    private readonly model;
    static LOOK_AHEAD_TIME: number;
    static SCHEDULE_TIME: number;
    static ADDITIONAL_LATENCY: number;
    static SEMIQUAVER: number;
    static RELEASE_TIME: number;
    static VOICE_GAIN: number;
    static NOTES: Float32Array<ArrayBuffer>;
    private readonly context;
    private readonly voiceMix;
    private nextScheduleTime;
    private absoluteTime;
    private intervalId;
    private bpm;
    constructor(model: Model);
    start(): void;
    stop(): void;
    pause(): void;
    private schedule;
    private computeStartOffset;
    private barsToSeconds;
    private secondsToBars;
    private playVoice;
    private buildFxChain;
}
