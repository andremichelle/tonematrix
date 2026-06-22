export const midiToFrequency = (note) => 440.0 * Math.pow(2.0, (note + 3.0) / 12.0 - 6.0)

export const barsToSeconds = (bars, bpm) => bars * 240.0 / bpm

export const secondsToBars = (seconds, bpm) => seconds * bpm / 240.0

export const barsToFrames = (bars, bpm, sampleRate) => (bars * 240.0 / bpm) * sampleRate

export const framesToBars = (frames, bpm, sampleRate) => (frames / sampleRate) * (bpm / 240.0)

export const attackRelease = (seconds, attachTime, releaseTime) =>
    Math.max(0.0, Math.min(seconds / attachTime, 1.0 - (seconds - attachTime) / releaseTime))

export function* fragment(p0, p1, stepSize) {
    let index = Math.ceil(p0 / stepSize)
    let position = index * stepSize
    while (position < p1) {
        yield {position, index}
        position = ++index * stepSize
    }
}