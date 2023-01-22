/* PALETTE TOOL STUFF
TODO:
- is PaletteTool the best name?
- should it create its own color picker?
*/
function PaletteTool(colorPicker,labelIds,nameFieldId) {
	var self = this;

	var colorPickerIndex = 0;

	var curPaletteId = sortedPaletteIdList()[0];

	function UpdatePaletteUI() {
		// update name field
		var palettePlaceholderName = localization.GetStringOrFallback("palette_label", "palette");
		document.getElementById(nameFieldId).placeholder = palettePlaceholderName + " " + GetSelectedId();
		var name = palette[ GetSelectedId() ].name;
		if( name ) {
			document.getElementById(nameFieldId).value = name;
		}
		else {
			document.getElementById(nameFieldId).value = "";
		}

		updateColorPickerUI();
	}

	events.Listen("game_data_change", function(event) {
		// make sure we have valid palette id
		if (palette[curPaletteId] === undefined || curPaletteId === "default") {
			if (sortedPaletteIdList().length > 0) {
				curPaletteId = sortedPaletteIdList()[0];
			}
			else {
				curPaletteId = "default";
			}
		}

		UpdatePaletteUI();
	});

	// public
	function changeColorPickerIndex(index) {
		colorPickerIndex = index;
		var color = getPal(GetSelectedId())[ index ];
		// bitsyLog(color, "editor");
		colorPicker.setColor( color[0], color[1], color[2] );
	}
	this.changeColorPickerIndex = changeColorPickerIndex;

	function updateColorPickerLabel(index, r, g, b) {
		var rgbColor = {r:r, g:g, b:b};

		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
		var hsvColor = RGBtoHSV( rgbColor );
		document.getElementById( labelIds[ index ] ).style.background = rgbColorStr;

		document.getElementById(labelIds[ index ])
			.setAttribute("class", hsvColor.v < 0.5 ? "colorPaletteLabelDark" : "colorPaletteLabelLight");
	}

	// public
	function updateColorPickerUI() {
		var color0 = getPal(GetSelectedId())[ 0 ];
		var color1 = getPal(GetSelectedId())[ 1 ];
		var color2 = getPal(GetSelectedId())[ 2 ];

		updateColorPickerLabel(0, color0[0], color0[1], color0[2] );
		updateColorPickerLabel(1, color1[0], color1[1], color1[2] );
		updateColorPickerLabel(2, color2[0], color2[1], color2[2] );

		changeColorPickerIndex( colorPickerIndex );
	}
	this.updateColorPickerUI = updateColorPickerUI;

	events.Listen("color_picker_change", function(event) {
		getPal(GetSelectedId())[ colorPickerIndex ][ 0 ] = event.rgbColor.r;
		getPal(GetSelectedId())[ colorPickerIndex ][ 1 ] = event.rgbColor.g;
		getPal(GetSelectedId())[ colorPickerIndex ][ 2 ] = event.rgbColor.b;

		// todo : test if this is broken now..
		// renderer.SetPalettes(palette); // TODO: having to directly interface w/ the renderer is probably bad

		updateColorPickerLabel(colorPickerIndex, event.rgbColor.r, event.rgbColor.g, event.rgbColor.b );

		if( event.isMouseUp && !events.IsEventActive("game_data_change") ) {
			events.Raise("palette_change"); // TODO -- try including isMouseUp and see if we can update more stuff live
			if (roomTool) {
				roomTool.select(roomTool.getSelected());
			}
		}
	});

	this.Select = function(id) {
		curPaletteId = id;
		UpdatePaletteUI();
	};

	function SelectPrev() {
		var idList = sortedPaletteIdList();
		var index = idList.indexOf(curPaletteId);

		index--;
		if (index < 0) {
			index = idList.length - 1;
		}

		curPaletteId = idList[index];

		UpdatePaletteUI();
	}
	this.SelectPrev = SelectPrev;

	this.SelectNext = function() {
		var idList = sortedPaletteIdList();
		var index = idList.indexOf(curPaletteId);

		index++;
		if (index >= idList.length) {
			index = 0;
		}

		curPaletteId = idList[index];

		UpdatePaletteUI();
	}

	this.AddNew = function() {
		// create new palette and save the data
		var id = nextPaletteId();

		palette[ id ] = {
			name : null,
			id : id,
			colors : [
			hslToRgb(Math.random(), 1.0, 0.5),
			hslToRgb(Math.random(), 1.0, 0.5),
			hslToRgb(Math.random(), 1.0, 0.5) ]
		};

		curPaletteId = id;
		UpdatePaletteUI();

		events.Raise("palette_list_change");
	}

	this.AddDuplicate = function() {
		var sourcePalette = palette[curPaletteId] === undefined ? palette["default"] : palette[curPaletteId];
		var curColors = sourcePalette.colors;

		var id = nextPaletteId();
		palette[ id ] = {
			id : id,
			name : null,
			colors : [],
		};

		for (var i = 0; i < curColors.length; i++) {
			palette[id].colors.push(curColors[i].slice());
		}

		curPaletteId = id;
		UpdatePaletteUI();

		events.Raise("palette_list_change");
	}

	this.DeleteSelected = function() {
		if (sortedPaletteIdList().length <= 1) {
			alert("You can't delete your only palette!");
		}
		else if (confirm("Are you sure you want to delete this palette?")) {
			delete palette[curPaletteId];

			// replace palettes for rooms using the current palette
			var replacementPalId = sortedPaletteIdList()[0];
			var roomIdList = sortedRoomIdList();
			for (var i = 0; i < roomIdList.length; i++) {
				var roomId = roomIdList[i];
				if (room[roomId].pal === curPaletteId) {
					room[roomId].pal = replacementPalId;
				}
			}

			SelectPrev();

			events.Raise("palette_list_change");
		}
	}

	function GetSelectedId() {
		if (sortedPaletteIdList().length <= 0) {
			return "default";
		}
		else {
			return curPaletteId;
		}
	}
	this.GetSelectedId = GetSelectedId;

	this.ChangeSelectedPaletteName = function(name) {
		var obj = palette[ GetSelectedId() ];
		if(name.length > 0) {
			obj.name = name;
		}
		else {
			obj.name = null;
		}

		updateNamesFromCurData() // TODO ... this should really be an event?

		events.Raise("palette_list_change");
	}

	// init yourself
	UpdatePaletteUI();
}