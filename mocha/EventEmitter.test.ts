import * as assert from "assert"
import {expect} from "chai"

import {EventEmitter} from "EventEmitter"

const counter = () => {
	let count = 0
	return {
		value: () => count,
		add: () => count++
	}
}


describe("EventEmitter", () => {

	it("should emit", () => {

		const em = new EventEmitter<"test">()
		const count = counter()

		em.on("test", count.add)

		em.emit("test")
		expect(count.value()).to.equal(1)

		em.emit("test")
		expect(count.value()).to.equal(2)

		em.emit("test")
		expect(count.value()).to.equal(3)
	})

	it("should remove by handler", () => {

		const em = new EventEmitter<"testA" | "testB">()
		const countA = counter()
		const countB = counter()

		em.on("testA", countA.add)
		em.on("testB", countB.add)


		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(1)
		expect(em.countEventListeners()).to.equal(2)
		expect(em.countEventListeners("testA")).to.equal(1)
		expect(em.countEventListeners("testB")).to.equal(1)

		em.off("testA", countA.add)
		expect(em.countEventListeners()).to.equal(1)
		expect(em.countEventListeners("testA")).to.equal(0)
		expect(em.countEventListeners("testB")).to.equal(1)


		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(2)

	})


	it("should remove by name", () => {

		const em = new EventEmitter<"testA" | "testB">()
		const countA = counter()
		const countB = counter()

		em.on("testA", countA.add)
		em.on("testB", countB.add)

		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(1)

		em.removeEventListeners("testA")

		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(2)

	})


	it("should remove all", () => {

		const em = new EventEmitter<"testA" | "testB">()
		const countA = counter()
		const countB = counter()

		em.on("testA", countA.add)
		em.on("testB", countB.add)

		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(1)

		em.removeEventListeners()

		em.emit("testA")
		em.emit("testB")
		expect(countA.value()).to.equal(1)
		expect(countB.value()).to.equal(1)

	})

	it("should once", () => {

		const em = new EventEmitter<"test">()
		const count = counter()

		em.once("test", count.add)

		em.emit("test")
		expect(count.value()).to.equal(1)

		em.emit("test")
		expect(count.value()).to.equal(1)

		em.emit("test")
		expect(count.value()).to.equal(1)
	})

	it("should schuedlue", () => {

		const em = new EventEmitter<"test">()
		const count = counter()

		expect(em.schedule("test", count.add)).to.equal(true)
		expect(em.schedule("test", count.add)).to.equal(false)
		expect(em.schedule("test", count.add)).to.equal(false)

		em.emit("test")
		expect(count.value()).to.equal(1)

		em.emit("test")
		expect(count.value()).to.equal(1)

	})

	it("should schuedlue with wrapped", () => {

		// Create a custom class that wraps handler functions
		class EventEmitterTest<EventName> extends EventEmitter<EventName> {
			wrapEventListener(eventName: EventName, handler: Function) {
				return () => {
					handler()
				}
			}
		}

		const em = new EventEmitterTest<"test">()
		const count = counter()

		expect(em.schedule("test", count.add)).to.equal(true)
		expect(em.schedule("test", count.add)).to.equal(false)
		expect(em.schedule("test", count.add)).to.equal(false)

		em.emit("test")
		expect(count.value()).to.equal(1)

		em.emit("test")
		expect(count.value()).to.equal(1)

	})

	// it("should wrap", () => {

	// 	let wrapCounter = 0

	// 	// Create a custom class that wraps handler functions
	// 	class EventEmitterTest<EventName> extends EventEmitter<EventName> {
	// 		wrapEventListener(eventName: EventName, handler: Function) {
	// 			return () => {
	// 				wrapCounter++
	// 				handler()
	// 			}
	// 		}
	// 	}

	// 	const em = new EventEmitterTest<"test">()
	// 	const count = counter()

	// 	em.on("test", count.add)

	// 	em.emit("test")
	// 	expect(count.value()).to.equal(1)
	// 	expect(wrapCounter).to.equal(1)

	// 	em.emit("test")
	// 	expect(count.value()).to.equal(2)
	// 	expect(wrapCounter).to.equal(2)

	// 	em.removeEventListeners("test", count.add)

	// 	em.emit("test")
	// 	expect(count.value()).to.equal(2)
	// 	expect(wrapCounter).to.equal(2)

	// })

	it("should once per emitter", () => {

		const em1 = new EventEmitter<"test">()
		const em2 = new EventEmitter<"test">()

		const count = counter()
		em1.once("test", count.add)
		em2.on("test", count.add)

		em1.emit("test")
		em2.emit("test")
		expect(count.value()).to.equal(2)

		em1.emit("test")
		em2.emit("test")
		expect(count.value()).to.equal(3)

	})

	it("should only once per emitter", () => {

		let counter = 0
		const f = () => counter++

		const a = new EventEmitter<"test">()
		const b = new EventEmitter<"test">()

		a.once("test", f)
		b.on("test", f)

		a.emit("test")
		expect(counter).to.equal(1)
		a.emit("test")
		expect(counter).to.equal(1)

		b.emit("test")
		b.emit("test")
		b.emit("test")
		expect(counter).to.equal(4)

	})


	it("should count total events", () => {

		let counter = 0

		const f = () => counter++
		const em = new EventEmitter<"testA" | "testB">()

		em.on("testA", f)
		expect(em.countEventListeners()).to.equal(1)
		em.on("testA", f)
		expect(em.countEventListeners()).to.equal(2)

		em.on("testB", f)
		expect(em.countEventListeners()).to.equal(3)

		em.removeEventListeners("testA")
		expect(em.countEventListeners()).to.equal(1)

		em.removeEventListeners()
		expect(em.countEventListeners()).to.equal(0)
	})

	it("should count events for once", () => {

		let counter = 0

		const f = () => counter++
		const em = new EventEmitter<"testA">()

		em.once("testA", f)
		expect(em.countEventListeners()).to.equal(1)
		em.emit("testA")
		expect(counter).to.equal(1)
		expect(em.countEventListeners()).to.equal(0)
	})

	it("should count total events for once", () => {

		let counter = 0

		const f = () => counter++
		const em = new EventEmitter<"testA">()

		em.once("testA", f)
		expect(em.countEventListeners()).to.equal(1)
		expect(em.countEventListeners("testA")).to.equal(1)

		em.emit("testA")
		expect(counter).to.equal(1)
		expect(em.countEventListeners()).to.equal(0)
		expect(em.countEventListeners("testA")).to.equal(0)

		em.emit("testA")
		em.emit("testA")
		em.emit("testA")
		expect(counter).to.equal(1)
		expect(em.countEventListeners()).to.equal(0)
		expect(em.countEventListeners("testA")).to.equal(0)

	})

	it("should report all listeners", () => {

		let counter = 0

		const f = () => counter++
		const em = new EventEmitter<"testA">()

		em.once("testA", f)
		expect(em.countEventListeners()).to.equal(1)
		expect(em.countEventListeners("testA")).to.equal(1)

		em.emit("testA")
		expect(counter).to.equal(1)
		expect(em.countEventListeners()).to.equal(0)
		expect(em.countEventListeners("testA")).to.equal(0)

		em.emit("testA")
		em.emit("testA")
		em.emit("testA")
		expect(counter).to.equal(1)
		expect(em.countEventListeners()).to.equal(0)
		expect(em.countEventListeners("testA")).to.equal(0)

	})

})