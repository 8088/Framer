let tester = (require as any).context("mocha-loader!./", false, /test.ts$/)

tester.keys().forEach((key: string) => {
	tester(key)
})