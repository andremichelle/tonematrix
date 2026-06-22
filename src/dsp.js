export const midiToFrequency = (note) => {
    return 440.0 * Math.pow(2.0, (note + 3.0) / 12.0 - 6.0)
}

export const barsToSeconds = (bars, bpm) => {
    return bars * 240.0 / bpm
}

export const secondsToBars = (seconds, bpm) => {
    return seconds * bpm / 240.0
}

export const barsToFrames = (bars, bpm, sampleRate) => {
    return (bars * 240.0 / bpm) / sampleRate
}

export const framesToBars = (frames, bpm, sampleRate) => {
    return (frames / sampleRate) * (bpm / 240.0)
}

export function* fragment(p0, p1, stepSize) {
    let index = Math.ceil(p0 / stepSize)
    let position = index * stepSize
    while (position < p1) {
        yield {position, index}
        position = ++index * stepSize
    }
}