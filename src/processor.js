import {attackRelease, barsToFrames, fragment, framesToBars, midiToFrequency} from "./dsp.js"
import {Pattern} from "./pattern.js"

const FREQUENCIES = new Float32Array([
    midiToFrequency(96), midiToFrequency(93), midiToFrequency(91), midiToFrequency(89),
    midiToFrequency(86), midiToFrequency(84), midiToFrequency(81), midiToFrequency(79),
    midiToFrequency(77), midiToFrequency(74), midiToFrequency(72), midiToFrequency(69),
    midiToFrequency(67), midiToFrequency(65), midiToFrequency(62), midiToFrequency(60)
])

class Voice {
    #frequency
    #panning
    #startIndex
    #phase = 0.0 // seconds

    constructor(frequency, panning, startIndex) {
        this.#frequency = frequency
        this.#panning = panning
        this.#startIndex = startIndex
    }

    process([l, r]) {
        const ATTACK_TIME = 0.005
        const RELEASE_TIME = 0.2
        const GAIN = 0.25

        for (let i = this.#startIndex; i < 128; i++) {
            // AR envelope
            const env = attackRelease(this.#phase, ATTACK_TIME, RELEASE_TIME) * GAIN

            // Oscillator
            const sine = Math.sin(2.0 * Math.PI * this.#frequency * this.#phase) * env

            // Stereo Panning
            // https://www.desmos.com/calculator/jacbeatbx3
            l[i] += Math.cos((this.#panning + 1.0) * (Math.PI / 4.0)) * sine
            r[i] += Math.sin((this.#panning + 1.0) * (Math.PI / 4.0)) * sine

            this.#phase += 1.0 / sampleRate

            if (this.#phase > ATTACK_TIME + RELEASE_TIME) {
                return true
            }
        }
        this.#startIndex = 0
        return false
    }
}

registerProcessor("processor", class extends AudioWorkletProcessor {
    #pattern
    #stepIndex

    #voices = []
    #bars = 0.0
    #bpm = 120.0

    constructor(options) {
        super()

        this.#pattern = new Pattern(options.processorOptions.pattern)
        this.#stepIndex = new Uint8Array(options.processorOptions.stepIndex)
    }

    process(_inputs, [output]) {
        const p0 = this.#bars
        const p1 = p0 + framesToBars(128, this.#bpm, sampleRate)
        const stepSize = 1.0 / 16.0
        for (const frag of fragment(p0, p1, stepSize)) {
            const {position, index} = frag
            const x = index & 15
            this.#stepIndex[0] = x
            const startIndex = barsToFrames(position - p0, this.#bpm, sampleRate) | 0
            for (let y = 0; y < 16; y++) {
                if (this.#pattern.getStep(x, y)) {
                    this.#voices.push(new Voice(FREQUENCIES[y], (x / 15.0) * 2.0 - 1.0, startIndex))
                }
            }
        }
        for (let i = this.#voices.length - 1; i >= 0; i--) {
            if (this.#voices[i].process(output)) {
                this.#voices.splice(i, 1)
            }
        }
        this.#bars = p1
        return true
    }
})
