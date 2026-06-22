export class ArrayUtils {
    static fill(n, factory) {
        const array = []
        for (let i = 0; i < n; i++) {
            array[i] = factory(i)
        }
        return array
    }

    // noinspection JSUnusedLocalSymbols
    constructor() {}
}
