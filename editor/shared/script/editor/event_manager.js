function EventManager() {
	var callbacks = {};

	this.Listen = function(eventName, callback) {
		if (callbacks[eventName] == null) {
			callbacks[eventName] = [];
		}
		callbacks[eventName].push(callback);
	}

	// this.Remove // TODO (use indexOf)

	this.Raise = function(eventName, eventObj) {
		if (callbacks[eventName] == null) {
			return;
		}

		for (var i = 0; i < callbacks[eventName].length; i++) {
			callbacks[eventName][i](eventObj);
		}
	}
}