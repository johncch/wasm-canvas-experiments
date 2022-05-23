import { WasmRenderer } from 'wasm-bindgen-canvas'
const { instance } = await WebAssembly.instantiateStreaming(
    fetch('./assets/bare_metal_wasm.wasm'),
    {}
)

console.log('Welcome to the WASM Canvas benchmark')

const fps = new (class {
    constructor() {
        this.fps = document.getElementById('fps')
        this.history = document.getElementById('history')
        this.frames = []
        this.currentStat = null
        this.records = []
        this.lastFrameTimeStamp = performance.now()
        this.label = ''
    }

    reset(label) {
        this.label = label
        this.frames = []
        this.lastFrameTimeStamp = performance.now()
        if (this.currentStat) {
            this.records.push(this.currentStat)
            this.currentStat = null
        }
        this.renderCurrentStat()
    }

    renderCurrentStat() {
        // console.log(this.records.length)
        // if (this.records.length == 0) {
        //     this.history.innerHTML = ''
        //     return
        // }
        let header = `
            <h1>FPS</h1>
            <div>Computed on last 100 frames</div>
            <table>
                <th>
                    <tr>
                        <td>Mode</td>                        
                        <td>Avg</td>
                        <td>Min</td>
                        <td>Max</td>
                    </tr>
                </th>
        `.trim()
        let body = '<tbody>'

        body += this.records
            .map((item) => {
                return `<tr>
                    <td>${item.mode}</td>                  
                    <td>${item.mean}</td>
                    <td>${item.min}</td>
                    <td>${item.max}</td>
                </tr>
            `
            })
            .join('')
        body += '</tbody></table>'
        this.history.innerHTML =
            header + body.trim() + 'Currently: ' + this.label
    }

    render() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now()
        const delta = now - this.lastFrameTimeStamp
        this.lastFrameTimeStamp = now
        const fps = (1 / delta) * 1000

        // Save only the latest 100 timings
        this.frames.push(fps)
        if (this.frames.length > 100) {
            this.frames.shift()
        }

        let min = Infinity
        let max = -Infinity
        let sum = 0
        for (let i = 0; i < this.frames.length; i++) {
            sum += this.frames[i]
            min = Math.min(this.frames[i], min)
            max = Math.max(this.frames[i], max)
        }
        let mean = sum / this.frames.length

        const stats = {
            mode,
            latest: Math.round(fps),
            mean: Math.round(mean),
            min: Math.round(min),
            max: Math.round(max),
        }
        this.currentStat = stats

        // Render the statistics.
        this.textString = `
    latest = ${Math.round(fps)}; last 100,
    avg = ${Math.round(mean)};
    min = ${Math.round(min)};
    max = ${Math.round(max)}
  `.trim()
        this.fps.textContent = this.label + ':' + this.textString
    }
})()

// Play Pause Button

const playPauseButton = document.getElementById('play-pause')

const PLAY = 'Play'
const PAUSE = 'Pause'
let animationId = null

playPauseButton.addEventListener('click', () => {
    if (isPaused()) {
        fps.reset(mode)
        play()
    } else {
        fps.reset(mode)
        pause()
    }
})

const isPaused = () => {
    return animationId === null
}

const play = () => {
    playPauseButton.textContent = PAUSE
    render()
}

const pause = () => {
    playPauseButton.textContent = PLAY
    cancelAnimationFrame(animationId)
    animationId = null
}

// Mode selection

const modeControl = document.getElementById('mode')
let mode = modeControl.value
fps.reset(mode)

modeControl.addEventListener('change', (event) => {
    let value = event.currentTarget.value
    mode = value
    fps.reset(value)
})

// Rendering

const width = 1200
const height = 1200

const canvasId = 'demo-canvas'
const canvas = document.getElementById(canvasId)
canvas.width = width
canvas.height = height

const buffer_address = instance.exports.BUFFER.value
const image = new ImageData(
    new Uint8ClampedArray(
        instance.exports.memory.buffer,
        buffer_address,
        4 * width * height
    ),
    width
)

const ctx = canvas.getContext('2d')

// JS Renderer
const jsRenderer = new (class {
    constructor() {
        this.frame = 0
        this.image_buffer = new ArrayBuffer(4 * width * height)
        this.image_array = new Uint8ClampedArray(this.image_buffer)
        this.image = new ImageData(this.image_array, width, height)
    }

    render() {
        this.frame += 1
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const res = this.frame + (x ^ y)
                const baseInd = y * width * 4 + x * 4
                this.image_array[baseInd] = res & 0xff
                this.image_array[baseInd + 1] = (res << 8) & 0xff
                this.image_array[baseInd + 2] = (res << 16) & 0xff
                this.image_array[baseInd + 3] = 0xff
            }
        }
    }
})()

// WASM Renderer
const wasmRenderer = WasmRenderer.new(canvasId, width, height)
wasmRenderer.height = 600

const render = () => {
    fps.render()

    if (mode == 'js-only') {
        jsRenderer.render()
        ctx.putImageData(jsRenderer.image, 0, 0)
    } else if (mode == 'wasm-to-js') {
        instance.exports.go()
        ctx.putImageData(image, 0, 0)
    } else {
        wasmRenderer.render()
    }

    animationId = requestAnimationFrame(render)
}
