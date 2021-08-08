// store if log categories are enabled
var DebugLogCategory = {
	bitsy : true,
	editor : true,
};

function bitsyLog(message, category) {
	if (!category) {
		category = "bitsy";
	}

	if (DebugLogCategory[category] === true) {
		console.log(category + "::" + message);
	}
}