var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Model } from "./tonematrix/model.js";
import { View } from "./tonematrix/view.js";
import { Audio } from "./tonematrix/audio.js";
class ToneMatrix {
    constructor(canvas) {
        this.canvas = canvas;
        this.model = new Model();
        this.view = new View(this.model, this.canvas);
        this.audio = new Audio(this.model);
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const tm = new ToneMatrix(document.querySelector("canvas#matrix"));
    if (location.hash !== "") {
        tm.model.pattern.deserialize(location.hash.substring(1));
    }
    document.querySelector("button#link").onclick = (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(`https://tonematrix.audiotool.com/#${tm.model.pattern.serialize()}`);
    };
    document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("dblclick", (event) => event.preventDefault(), { passive: false });
    const resize = () => document.body.style.height = `${window.innerHeight}px`;
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove());
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"));
    });
    console.debug("boot complete.");
}))();
//# sourceMappingURL=main.js.map