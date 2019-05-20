/* PALETTE TOOL STUFF
TODO:
- is PaletteTool the best name?
- should it create its own color picker?
*/
function PaletteTool(colorPicker,labelIds) {
	var self = this;

	var colorPickerIndex = 0;

	// public
	this.changeColorPickerIndex = function(index) {
		colorPickerIndex = index;
		var color = getPal(selectedColorPal())[ index ];
		// console.log(color);
		colorPicker.setColor( color[0], color[1], color[2] );
	}

	function updateColorPickerLabel(index, r, g, b) {
		var rgbColor = {r:r, g:g, b:b};

		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
		var hsvColor = RGBtoHSV( rgbColor );
		document.getElementById( labelIds[ index ] ).style.background = rgbColorStr;
		document.getElementById( labelIds[ index ] ).style.color = hsvColor.v < 0.5 ? "white" : "black";
	}

	// public
	this.updateColorPickerUI = function() {
		var color0 = getPal(selectedColorPal())[ 0 ];
		var color1 = getPal(selectedColorPal())[ 1 ];
		var color2 = getPal(selectedColorPal())[ 2 ];

		updateColorPickerLabel(0, color0[0], color0[1], color0[2] );
		updateColorPickerLabel(1, color1[0], color1[1], color1[2] );
		updateColorPickerLabel(2, color2[0], color2[1], color2[2] );

		changeColorPickerIndex( colorPickerIndex );
	}

	events.Listen("color_picker_change", function(event) {
		getPal(selectedColorPal())[ colorPickerIndex ][ 0 ] = event.rgbColor.r;
		getPal(selectedColorPal())[ colorPickerIndex ][ 1 ] = event.rgbColor.g;
		getPal(selectedColorPal())[ colorPickerIndex ][ 2 ] = event.rgbColor.b;

		updateColorPickerLabel(colorPickerIndex, event.rgbColor.r, event.rgbColor.g, event.rgbColor.b );

		if( event.isMouseUp ) {
			events.Raise("palette_change"); // TODO -- try including isMouseUp and see if we can update more stuff live
		}
	});
}