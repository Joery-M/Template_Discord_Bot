module.exports = {
	name: "discordDisableAll",

    // Function set all disabled
    /**
     * @param {Array} components
     * @param {Number} rowAmount
     * @description The rowAmount starts from 0, so if you only want the first row to disable, set rowAmount to 1.
     */
	execute(components, rowAmount) {
		components.forEach((element, i) => {
            if (i >= rowAmount) {
                return
            }
            element.components.forEach(element => {
                element.disabled = true
            })
        });
        return components
	},
}
