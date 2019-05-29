function EventManager() {
	var callbacks = {};

	var eventStack = [];

	this.Listen = function(eventName, callback) {
		if (callbacks[eventName] == null) {
			callbacks[eventName] = [];
		}
		callbacks[eventName].push(callback);
	}

	// this.Remove // TODO (use indexOf)

	this.Raise = function(eventName, eventObj) {
		// console.log(">>> EVENT > " + eventName);

		if (callbacks[eventName] == null) {
			return;
		}

		eventStack.push(eventName);
		// console.log(eventStack);

		for (var i = 0; i < callbacks[eventName].length; i++) {
			callbacks[eventName][i](eventObj);
		}

		eventStack.pop();
	}

	this.IsEventActive = function(eventName) {
		return eventStack.indexOf(eventName) > -1;
	}
}