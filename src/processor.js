import {fragment, framesToBars, midiToFrequency} from "./dsp.js"
import {Pattern} from "./pattern.js";

const NOTES = new Float32Array([
    midiToFrequency(96), midiToFrequency(93), midiToFrequency(91), midiToFrequency(89),
    midiToFrequency(86), midiToFrequency(84), midiToFrequency(81), midiToFrequency(79),
    midiToFrequency(77), midiToFrequency(74), midiToFrequency(72), midiToFrequency(69),
    midiToFrequency(67), midiToFrequency(65), midiToFrequency(62), midiToFrequency(60)
])

registerProcessor("processor", class extends AudioWorkletProcessor {
    #pattern
    #bars = 0.0
    #bpm = 120.0

    constructor(options) {
        super()

        this.#pattern = new Pattern(options.processorOptions.buffer)
    }

    process(_inputs, [output]) {
        const [left, right] = output

        const p0 = this.#bars
        const p1 = p0 + framesToBars(128, this.#bpm, sampleRate)
        const stepSize = 1.0 / 16.0
        for (const frag of fragment(p0, p1, stepSize)) {
            const {position, index} = frag
            const x = index & 15
            for (let y = 0; y < 16; y++) {
                if (this.#pattern.getStep(x, y)) {
                    console.debug(index, position)
                }
            }
        }
        this.#bars = p1
        return true
    }
})