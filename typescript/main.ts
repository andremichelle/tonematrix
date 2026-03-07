import {Model} from "./tonematrix/model.js"
import {View} from "./tonematrix/view.js"
import {Audio} from "./tonematrix/audio.js"

class ToneMatrix {
    readonly model: Model = new Model()
    readonly view: View = new View(this.model, this.canvas)
    readonly audio: Audio = new Audio(this.model)

    constructor(private readonly canvas: HTMLCanvasElement) {
    }
}

(async () => {
    const tm = new ToneMatrix(document.querySelector("canvas#matrix"))
    if (location.hash !== "") {
        tm.model.pattern.deserialize(location.hash.substring(1))
    }
    (document.querySelector("button#link") as HTMLButtonElement).onclick = (event: MouseEvent) => {
        event.preventDefault()
        navigator.clipboard.writeText(`https://tonematrix.audiotool.com/#${tm.model.pattern.serialize()}`)
    }

    // prevent dragging entire document on mobile
    document.addEventListener("touchmove", (event: TouchEvent) => event.preventDefault(), {passive: false})
    document.addEventListener("dblclick", (event: Event) => event.preventDefault(), {passive: false})
    const resize = () => document.body.style.height = `${window.innerHeight}px`
    window.addEventListener("resize", resize)
    resize()
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove())
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"))
    })
    console.debug("boot complete.")
})()