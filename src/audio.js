import {barsToSeconds, midiToFrequency, secondsToBars} from "./dsp.js"

export class Audio {
    static LOOK_AHEAD_TIME = 0.010
    static SCHEDULE_TIME = 0.010
    static ADDITIONAL_LATENCY = 0.005
    static SEMIQUAVER = 1.0 / 16.0
    static RELEASE_TIME = 0.250
    static VOICE_GAIN = 0.75
    static NOTES = new Float32Array([
        midiToFrequency(96),
        midiToFrequency(93),
        midiToFrequency(91),
        midiToFrequency(89),
        midiToFrequency(86),
        midiToFrequency(84),
        midiToFrequency(81),
        midiToFrequency(79),
        midiToFrequency(77),
        midiToFrequency(74),
        midiToFrequency(72),
        midiToFrequency(69),
        midiToFrequency(67),
        midiToFrequency(65),
        midiToFrequency(62),
        midiToFrequency(60)
    ])

    #context = new AudioContext()
    #voiceMix = this.#context.createGain()

    #pattern

    #nextScheduleTime = 0.0
    #absoluteTime = 0.0
    #intervalId = -1
    #bpm = 120.0

    constructor(pattern) {
        this.#pattern = pattern
        this.#buildFxChain()

        if (this.#context.state === "running") {
            this.start()
        } else {
            const capture = {capture: true}
            const listener = event => {
                event.preventDefault()
                this.#context.resume().then(() => this.start())
                window.removeEventListener("mousedown", listener, capture)
                window.removeEventListener("touchstart", listener, capture)
            }
            window.addEventListener("mousedown", listener, capture)
            window.addEventListener("touchstart", listener, capture)
        }
    }

    start() {
        if (-1 < this.#intervalId) {
            return
        }
        this.#absoluteTime = 0.0
        this.#nextScheduleTime = this.#context.currentTime + Audio.LOOK_AHEAD_TIME
        this.#intervalId = setInterval(() => {
            const now = this.#context.currentTime
            if (now + Audio.LOOK_AHEAD_TIME >= this.#nextScheduleTime) {
                const m0 = this.#absoluteTime
                const m1 = m0 + Audio.SCHEDULE_TIME
                const t0 = secondsToBars(m0, this.#bpm)
                const t1 = secondsToBars(m1, this.#bpm)
                this.#schedule(t0, t1)
                this.#absoluteTime += Audio.SCHEDULE_TIME
                this.#nextScheduleTime += Audio.SCHEDULE_TIME
            }
        }, 1)
    }

    stop() {
        this.pause()
        this.#absoluteTime = 0.0
    }

    pause() {
        if (-1 === this.#intervalId) {
            return
        }
        clearInterval(this.#intervalId)
        this.#intervalId = -1
    }

    #schedule(t0, t1) {
        let index = (t0 / Audio.SEMIQUAVER) | 0
        if (index < 0) {
            return
        }
        let barPosition = index * Audio.SEMIQUAVER
        while (barPosition < t1) {
            if (barPosition >= t0) {
                const time = this.#computeStartOffset(barPosition)
                const x = index & 15
                for (let y = 0; y < 16; y++) {
                    if (this.#pattern.getStep(x, y)) {
                        this.#playVoice(time, y)
                    }
                }
            }
            barPosition = ++index * Audio.SEMIQUAVER
        }
        const bars = secondsToBars(this.#absoluteTime + Audio.SCHEDULE_TIME, this.#bpm)
        this.#pattern.stepIndex = (Math.floor(bars / Audio.SEMIQUAVER) - 1) & 15
    }

    #computeStartOffset(barPosition) {
        return (this.#nextScheduleTime - this.#absoluteTime) +
            barsToSeconds(barPosition, this.#bpm) + Audio.ADDITIONAL_LATENCY
    }

    #playVoice(time, rowIndex) {
        const context = this.#context
        const endTime = time + Audio.RELEASE_TIME
        const oscillator = context.createOscillator()
        const envelope = context.createGain()
        const panner = context.createStereoPanner()
        panner.pan.value = Math.random() - Math.random()
        envelope.gain.value = Audio.VOICE_GAIN
        envelope.gain.setValueAtTime(Audio.VOICE_GAIN, time)
        envelope.gain.linearRampToValueAtTime(0.0, endTime)
        oscillator.frequency.value = Audio.NOTES[rowIndex]
        oscillator.connect(panner)
        panner.connect(envelope)
        envelope.connect(this.#voiceMix)
        oscillator.start(time)
        oscillator.stop(endTime)
    }

    #buildFxChain() {
        const delay = this.#context.createDelay()
        delay.delayTime.value = barsToSeconds(3.0 / 16.0, this.#bpm)
        const feedbackGain = this.#context.createGain()
        feedbackGain.gain.value = 0.4
        const wetGain = this.#context.createGain()
        wetGain.gain.value = 0.1
        this.#voiceMix.connect(delay)
        delay.connect(feedbackGain)
        feedbackGain.connect(delay)
        feedbackGain.connect(wetGain)
        wetGain.connect(this.#context.destination)
    }
}
