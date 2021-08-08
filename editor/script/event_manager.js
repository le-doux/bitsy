function EventManager() {
	var callbacks = {};

	var eventStack = [];

	var isDebug = false;

	this.Listen = function(eventName, callback) {
		if (callbacks[eventName] == null) {
			callbacks[eventName] = [];
		}
		callbacks[eventName].push(callback);

		if (isDebug) {
			bitsyLog("EVENTS >>> " + eventName + " >>> " + callbacks[eventName].length, "editor");
		}

		return callback;
	}

	this.Unlisten = function(eventName, callback) {
		if (callbacks.hasOwnProperty(eventName)) {
			var i = callbacks[eventName].indexOf(callback);
			if (i > -1) {
				callbacks[eventName].splice(i, 1);

				if (isDebug) {
					bitsyLog("EVENTS >>> " + eventName + " >>> " + callbacks[eventName].length, "editor");
				}
			}
		}
	}

	// this.Remove // TODO (use indexOf)

	this.Raise = function(eventName, eventObj) {
		// bitsyLog(">>> EVENT > " + eventName, "editor");

		if (callbacks[eventName] == null) {
			return;
		}

		eventStack.push(eventName);
		// bitsyLog(eventStack, "editor");

		for (var i = 0; i < callbacks[eventName].length; i++) {
			callbacks[eventName][i](eventObj);
		}

		eventStack.pop();
	}

	this.IsEventActive = function(eventName) {
		return eventStack.indexOf(eventName) > -1;
	}
}

function EventListener(eventManager) {
	var callbackReferences = {};

	function Unlisten(eventName) {
		if (callbackReferences.hasOwnProperty(eventName)) {
			eventManager.Unlisten(eventName, callbackReferences[eventName]);
			delete callbackReferences[eventName];
		}
	}

	this.Listen = function(eventName, callback) {
		Unlisten(eventName);
		callbackReferences[eventName] = eventManager.Listen(eventName, callback);
	}

	this.Unlisten = Unlisten;

	this.UnlistenAll = function() {
		for (eventName in callbackReferences) {
			Unlisten(eventName);
		}
	}
}