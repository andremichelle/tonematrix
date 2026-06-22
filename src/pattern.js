export class Pattern {
    static BYTE_LENGTH = 16 * Uint32Array.BYTES_PER_ELEMENT

    #data

    constructor(buffer) {
        this.#data = new Uint32Array(buffer)
    }

    get buffer() {
        return this.#data.buffer
    }

    setStep(x, y, value) {
        if (value) {
            this.#data[y] |= 1 << x
        } else {
            this.#data[y] &= ~(1 << x)
        }
    }

    getStep(x, y) {
        return 0 !== (this.#data[y] & (1 << x))
    }

    clear() {
        this.#data.fill(0)
    }
}