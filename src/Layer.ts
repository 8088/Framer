import * as _ from "lodash-es"
import * as types from "Types"
import * as Utils from "Utils"

import {BaseClass} from "BaseClass"
import {Collection} from "Collection"
import {Context, DefaultContext, CurrentContext} from "Context"
import {AnimatableProperties} from "AnimationProperty"
import {Animation, AnimationEventTypes} from "Animation"
import {AnimationCurve} from "AnimationCurve"
import {Curve} from "Curve"


export interface LayerOptions {
	context?: Context
	parent?: Layer|null
	x?: number
	y?: number
	z?: number
	width?: number
	height?: number
	backgroundColor?: string
	point?: types.Point,
	size?: types.Size,
	frame?: types.Frame,
	opacity?: number
	image?: string|null,
	style?: types.CSSStyles,
}

type LayerProperties = keyof LayerOptions

export type LayerEventPropertyTypes =
	"change:x" |
	"change:y" |
	"change:width" |
	"change:height"

export type LayerEventUserTypes =
	"click" |
	"doubleclick" |
	"mouseup" |
	"mousedown" |
	"mouseover" |
	"mouseout" |
	"mousemove" |
	"mousewheel"

export type LayerEventTypes =
	LayerEventPropertyTypes |
	LayerEventUserTypes |
	AnimationEventTypes


export class Layer extends BaseClass<LayerEventTypes> {

	private _context: Context
	private _parent: Layer|null
	private _properties = {
		x: 0,
		y: 0,
		z: 0,
		width: 200,
		height: 200,
		backgroundColor: "rgba(255, 0, 0, 0.5)",
		opacity: 1,
		image: null,
		styles: {}
	}

	_initialized = false
	_element: HTMLElement
	_animations = new Collection<Animation>()

	constructor(options: LayerOptions= {}) {
		super()

		this._setId(this.context.addLayer(this))

		// TODO: Maybe we store parent by id in properties?
		if (options.parent) {
			this.parent = options.parent
		}

		Utils.assignOrdered(this, options, ["frame", "size", "point"])

		this._initialized = true
		this.context.renderer.updateStructure(this)

	}

	get initialized() {
		return this._initialized
	}

	get context(): Context {
		return this._context || CurrentContext
	}

	get parent() {
		return this._parent
	}

	set parent(value) {

		if (this.parent === value) {
			return
		}

		this._parent = value
		this.context.renderer.updateStructure(this)
		this._didChangeKey("parent", value)

	}

	get children(): Layer[] {
		return this.context.layers.filter((layer) => {
			return layer.parent === this
		})
	}

	get x() {
		return this._properties.x
	}

	set x(value) {
		if (!this._shouldChangeKey("x", value)) { return }
		this._properties.x = value
		this._didChangeKey("x", value)
		this.context.renderer.updateKeyStyle(this, "x", value)
	}

	get y() {
		return this._properties.y
	}

	set y(value) {
		if (!this._shouldChangeKey("y", value)) { return }
		this._properties.y = value
		this._didChangeKey("y", value)
		this.context.renderer.updateKeyStyle(this, "y", value)
	}

	get z() {
		return this._properties.z
	}

	set z(value) {
		if (!this._shouldChangeKey("z", value)) { return }
		this._properties.y = value
		this._didChangeKey("z", value)
		this.context.renderer.updateKeyStyle(this, "z", value)
	}

	get width() {
		return this._properties.width
	}

	set width(value) {
		if (!this._shouldChangeKey("width", value)) { return }
		this._properties.width = value
		this._didChangeKey("width", value)
		this.context.renderer.updateKeyStyle(this, "width", value)
	}

	get height() {
		return this._properties.height
	}

	set height(value) {
		if (!this._shouldChangeKey("height", value)) { return }
		this._properties.height = value
		this._didChangeKey("height", value)
		this.context.renderer.updateKeyStyle(this, "height", value)
	}

	get point(): types.Point {
		return {x: this.x, y: this.y}
	}

	set point(point: types.Point) {
		Object.assign(this, point)
	}

	get size(): types.Size {
		return {width: this.width, height: this.height}
	}

	set size(size: types.Size) {
		Object.assign(this, size)
	}

	get frame(): types.Frame {
		return {
			x: this.width,
			y: this.height,
			width: this.width,
			height: this.height
		}
	}

	set frame(frame: types.Frame) {
		Object.assign(this, frame)
	}

	get backgroundColor() {
		return this._properties.backgroundColor
	}

	set backgroundColor(value) {
		if (!this._shouldChangeKey("backgroundColor", value)) { return }
		this._properties.backgroundColor = value
		this._didChangeKey("backgroundColor", value)
		this.context.renderer.updateKeyStyle(this, "backgroundColor", value)
	}

	get styles() {
		return this._properties.styles
	}

	set styles(styles: types.CSSStyles) {
		this.updateStyles(styles)
	}

	readonly updateStyles = (styles: types.CSSStyles) => {
		if (_.isEmpty(styles)) { return }
		Object.assign(this._properties.styles, styles)
		this.context.renderer.updateCustomStyles(this, styles)
	}

	// Animations

	/** Start an animation. */
	animate = (
		properties: AnimatableProperties,
		curve: AnimationCurve= Curve.linear(1)
	) => {
		let animation = new Animation(this, properties, curve)
		animation.start()
		return animation
	}

	/** List of current running animations. */
	get animations() {
		return this._animations.items()
	}


	// Events

	onClick = (handler: Function) => { this.on("click", handler) }
	onDoubleClick = (handler: Function) => { this.on("doubleclick", handler) }

	onMouseUp = (handler: Function) => { this.on("mouseup", handler) }
	onMouseDown = (handler: Function) => { this.on("mousedown", handler) }
	onMouseOver = (handler: Function) => { this.on("mouseover", handler) }
	onMouseOut = (handler: Function) => { this.on("mouseout", handler) }
	onMouseMove = (handler: Function) => { this.on("mousemove", handler) }
	onMouseWheel = (handler: Function) => { this.on("mousewheel", handler) }

	onAnimationStart = (handler: Function) => { this.on("AnimationStart", handler) }
	onAnimationStop = (handler: Function) => { this.on("AnimationStop", handler) }
	onAnimationHalt = (handler: Function) => { this.on("AnimationHalt", handler) }
	onAnimationEnd = (handler: Function) => { this.on("AnimationEnd", handler) }
	onChange = (property: LayerProperties, handler: Function) => { this.on(`change:${property}` as any, handler) }


	// Properties

	private _shouldChangeKey(key, value) {
		return this._properties[key] !== value
	}

	private _didChangeKey(key: string, value: any) {
		(this.emit as any)(`change:${key}`, value)
	}

	describe() {
		return `<Layer ${this.id} (${this.x}, ${this.y}) ${this.width} x ${this.height}>`
	}

}

