path = require("path")
config = require("./webpack.base")()

config.entry = {
	framer: path.join(__dirname, "../perf/index"),
}

module.exports = config
