import {EventEmitter} from "EventEmitter"
import * as raf from "raf"


const performance = (window.performance || {
	offset: Date.now(),
	now: function now() { return Date.now() - this.offset }
})

const time = () => performance.now() / 1000

type AnimationLoopEventNames = "render" | "update" | "finish"
type AnimationLoopDeltaCallback = (this: AnimationLoop, delta: number, loop: AnimationLoop) => void

export class AnimationLoop extends EventEmitter<AnimationLoopEventNames> {

	private _running = false
	private _counter = 0
	private _time = time()

	static get Default() {
		return DefaultAnimationLoop
	}

	get running() {
		return this._running
	}

	on(eventName: AnimationLoopEventNames, handler: Function, once=false) {

		super.on(eventName, handler, once)

		if (this._running === false) {
			this._start()
		}
	}

	private _start() {
		this._running = true
		raf(this.tick)
	}

	private _stop() {
		this._running = false
	}

	private tick = () => {

		this.emit("update", time() - this._time)
		this.emit("render", time() - this._time)

		this._time = time()
		this._counter++

		if (this.countEventListeners("update") > 0 || this.countEventListeners("render") > 0) {
			raf(this.tick)
		} else {
			this._stop()
		}

		this.emit("finish", time() - this._time)
	}
}

export const DefaultAnimationLoop = new AnimationLoop()