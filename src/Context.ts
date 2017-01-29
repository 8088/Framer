
import {BaseClass} from "./BaseClass"
import {Layer} from "./Layer"
import {Collection} from "./Collection"

interface ContextOptions {
	parent: Layer|Context|null,
	backgroundColor: string
}

export class Context extends BaseClass {

	static get Default() {
		return DefaultContext
	}

	static get Current() {
		return CurrentContext
	}

	private _layers = new Collection<Layer>()

	private _properties: ContextOptions = {
		parent: null,
		backgroundColor: "rgba(255, 0, 0, 0.5)"
	}

	constructor(options: ContextOptions|{}={}) {
		super()
	}

	addLayer(layer: Layer) {
		return this._layers.add(layer)
	}

	get layers() {
		return this._layers.items()
	}

	get children() {
		return this.layers.filter((layer) => { return !layer.parent })
	}

}

export const DefaultContext = new Context()
export let CurrentContext = DefaultContext