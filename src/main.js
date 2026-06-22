import {Model} from "./model.js"
import {View} from "./view.js"
import {Audio} from "./audio.js"

class ToneMatrix {
    model = new Model()
    view
    audio

    #canvas

    constructor(canvas) {
        this.#canvas = canvas
        this.view = new View(this.model, this.#canvas)
        this.audio = new Audio(this.model)
    }
}

(async () => {
    const tm = new ToneMatrix(document.querySelector("canvas#matrix"))
    if (location.hash !== "") {
        tm.model.pattern.deserialize(location.hash.substring(1))
    }
    document.querySelector("button#link").onclick = (event) => {
        event.preventDefault()
        navigator.clipboard.writeText(`https://tonematrix.audiotool.com/#${tm.model.pattern.serialize()}`)
    }

    // prevent dragging entire document on mobile
    document.addEventListener("touchmove", (event) => event.preventDefault(), {passive: false})
    document.addEventListener("dblclick", (event) => event.preventDefault(), {passive: false})
    const resize = () => document.body.style.height = `${window.innerHeight}px`
    window.addEventListener("resize", resize)
    resize()
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove())
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"))
    })
    console.debug("boot complete.")
})()
