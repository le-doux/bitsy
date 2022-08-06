function MouseInterface(tool) {
	this.hover = function() {
		return tool.mouseState.hover;
	};

	this.down = function() {
		return tool.mouseState.down;
	};

	this.pos = function() {
		return {
			x : tool.mouseState.x,
			y : tool.mouseState.y
		};
	};

	this.alt = function() {
		return tool.mouseState.altKey;
	};

	this.tooltip = function(text) {
		tool.canvasElement.title = text;
	};
}