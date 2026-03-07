import {ArrayUtils} from "../lib/common.js"
import {Model} from "./model.js"

export class View {
    private readonly graphics: CanvasRenderingContext2D = this.canvas.getContext("2d")
    private readonly stepTextureOn: HTMLCanvasElement = View.createStepTexture("#FFFFFF", "#DADADA")
    private readonly stepTextureOff: HTMLCanvasElement = View.createStepTexture("#4F4F4F", "#2A2A2A")
    private readonly wavesData: ImageData = new ImageData(16, 16)
    private readonly waves = View.create2dContext(16)
    private readonly fluidMaps: Float32Array[][] = [
        ArrayUtils.fill(16, () => new Float32Array(16)),
        ArrayUtils.fill(16, () => new Float32Array(16))
    ]

    private fluidMapIndex: number = 0
    private stepIndex: number = -1

    constructor(private readonly model: Model,
                private readonly canvas: HTMLCanvasElement) {
        this.canvas.width = 512
        this.canvas.height = 512
        this.initEvents()
        this.processAnimationFrame()
    }

    private initEvents() {
        let drawValue = false
        const listener = event => {
            event.preventDefault()
            if (event.type === "mousemove" && !event.buttons) {
                return
            }
            const clientRect = this.canvas.getBoundingClientRect()
            let clientX: number
            let clientY: number
            if (event.targetTouches !== undefined) {
                const touch = event.targetTouches.item(0)
                clientX = touch.clientX
                clientY = touch.clientY
            } else if (event instanceof MouseEvent) {
                clientX = event.clientX
                clientY = event.clientY
            } else {
                return
            }
            const scale = this.canvas.width / clientRect.width
            const x = ((clientX - clientRect.left) * scale) >> 5
            const y = ((clientY - clientRect.top) * scale) >> 5
            if (x < 0 || x >= 16 || y < 0 || y >= 16) return
            if (event.type === "mousedown" || event.type === "touchstart") {
                drawValue = !this.getStep(x, y)
            }
            this.setStep(x, y, drawValue)
        }
        this.canvas.addEventListener("mousedown", listener)
        this.canvas.addEventListener("touchstart", listener)
        this.canvas.addEventListener("mousemove", listener)
        this.canvas.addEventListener("touchmove", listener)
        window.addEventListener("pointerdown", event => {
            if (event.target instanceof HTMLButtonElement || event.target === this.canvas) {
                return
            }
            this.model.pattern.clear()
            event.preventDefault()
        }, {capture: false})
        window.addEventListener("keydown", event => {
            if (event.code === "Space") {
                this.model.pattern.clear()
            }
        }, {capture: true})
    }

    private setStep(x, y, value) {
        this.model.pattern.setStep(x, y, value)
        if (value) {
            this.touchFluid(x, y)
        }
    }

    private touchFluid(x, y) {
        this.fluidMaps[0][y][x] = -1.0
        this.fluidMaps[1][y][x] = -1.0
    }

    private getStep(x, y) {
        return this.model.pattern.getStep(x, y)
    }

    private processAnimationFrame = () => {
        this.touchActives()
        this.processFluid()
        this.graphics.imageSmoothingEnabled = false
        this.graphics.clearRect(0, 0, 512, 512)
        this.graphics.globalCompositeOperation = "source-over"
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const texture = this.model.pattern.getStep(x, y) ? this.stepTextureOn : this.stepTextureOff
                this.graphics.drawImage(texture, x << 5, y << 5)
            }
        }
        this.graphics.save()
        this.graphics.globalCompositeOperation = "lighter"
        this.graphics.filter = "blur(8px)"
        this.graphics.drawImage(this.waves.canvas, 0, 0, 512, 512)
        this.graphics.restore()
        requestAnimationFrame(this.processAnimationFrame)
    }

    private touchActives() {
        if (this.stepIndex !== this.model.stepIndex) {
            this.stepIndex = this.model.stepIndex
            for (let y = 0; y < 16; ++y) {
                if (this.model.pattern.getStep(this.stepIndex, y)) {
                    this.touchFluid(this.stepIndex, y)
                }
            }
        }
    }

    private processFluid() {
        const fma = this.fluidMaps[this.fluidMapIndex]
        const fmb = this.fluidMaps[1 - this.fluidMapIndex]
        const wavesData: ImageData = this.wavesData
        const data: Uint8ClampedArray = wavesData.data
        const damp: number = 0.86
        for (let y = 0; y < 16; ++y) {
            const f0 = fma[y - 1]
            const f1 = fma[y]
            const f2 = fma[y + 1]
            for (let x = 0; x < 16; ++x) {
                let amp: number = 0.0
                if (x > 0) amp += f1[x - 1]
                if (y > 0) amp += f0[x]
                if (x < 15) amp += f1[x + 1]
                if (y < 15) amp += f2[x]
                amp = (amp * 0.25 - fmb[y][x]) * damp
                if (amp < -1.0) {
                    amp = -1.0
                } else if (amp > 1.0) {
                    amp = 1.0
                }
                fmb[y][x] = amp
                const gray = Math.max(0, Math.min(255, (255 * amp ** 0.75) | 0))
                const index = ((y << 4) | x) << 2
                data[index] = gray
                data[index + 1] = gray
                data[index + 2] = gray
                data[index + 3] = 255
            }
        }
        this.fluidMapIndex = 1 - this.fluidMapIndex
        this.waves.putImageData(wavesData, 0, 0)
    }

    get domElement() {
        return this.canvas
    }

    private static createStepTexture(outline: string, inline: string): HTMLCanvasElement {
        const texture: CanvasRenderingContext2D = View.create2dContext(32)
        texture.save()
        texture.fillStyle = outline
        texture.fillRect(2, 2, 28, 28)
        texture.fillStyle = inline
        texture.fillRect(4, 4, 24, 24)
        texture.restore()
        return texture.canvas
    }

    private static create2dContext(size: number): CanvasRenderingContext2D {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = size
        return canvas.getContext("2d")
    }
}