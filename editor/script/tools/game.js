function makeGameTool() {
	return makeToolCard("game", function(tool) {
		tool.id = "game";
		tool.icon = "save";
		// todo : localize
		tool.name = function() { return "game"; };
		// TODO : this is kind of a hack! should I just indicate it with a undefined "loop"? or would that cause other problems?
		tool.disableCanvas = true;
		// TODO : where is the right place for this metadata?
		tool.size = "m";
		tool.insertBefore = "roomCheckSpan"; // todo : need a better way of defining the order of the tool buttons
		tool.aboutPage = "./tools/game";

		tool.loop = function(dt) {};

		// sub-menus
		var GameMenu = {
			FILE : 0,
			SETTINGS: 1,
			DATA : 2,
		};
		var curMenu = GameMenu.FILE;

		// game data
		var showFontDataInGameData = false;

		// tool settings
		var languageList = localization.GetLanguageList();

		// default export settings
		var exportSettings = {
			pageColor : "#ffffff",
			isFixedSize : false,
			fixedSize : 512
		};
		// load saved export settings
		exportSettings = Store.get("exportSettings", exportSettings);

		// setting groups
		var isToolSettingsGroupOpen = true;
		var isGameSettingsGroupOpen = true;
		var isExportSettingsGroupOpen = true;

		tool.menuUpdate = function() {
			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "select",
				value: curMenu,
				options: [
					// TODO : ?
					// {
					// 	text: "title",
					// 	icon: "text_edit",
					// 	description: "share or backup your game",
					// 	value: GameMenu.FILE,
					// },
					{
						text: { id: "download_tool_name", text: "save" },
						icon: "save",
						description: "share your game, make a backup, or start a new project",
						value: GameMenu.FILE,
					},
					{
						text: { id: "settings_tool_name", text: "settings" },
						icon: "settings",
						description: "tool, game, and export settings",
						value: GameMenu.SETTINGS,
					},
					{
						text: { id: "data_tool_name", text: "data" },
						icon: "game_data",
						description: "view and edit bitsy game data",
						value: GameMenu.DATA,
					}
				],
				onchange: function(e) {
					curMenu = parseInt(e.target.value);
				},
			});
			tool.menu.pop({ control: "group" });

			if (curMenu === GameMenu.FILE) {
				updateFileMenu();
			}
			else if (curMenu === GameMenu.SETTINGS) {
				updateSettingsMenu();
			}
			else if (curMenu === GameMenu.DATA) {
				updateDataMenu();
			}
		};

		function updateFileMenu() {
			tool.menu.push({
				control: "group",
				text: ".html", // todo : localize
				icon: "file",
				description: "html file format: browser playable game"
			});
			tool.menu.push({
				control: "button",
				text: { id: "download_game", text: "save game" },
				icon: "download",
				description: "save game as .html file",
				onclick: exportGame
			});
			tool.menu.push({
				control: "file",
				id: "import_html",
				text: { id: "upload_game", text: "load game" },
				icon: "upload",
				description: "load existing game from .html file",
				accept: ".html",
				onload: importGameFromFile
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({
				control: "group",
				text: ".bitsy", // todo : localize
				icon: "game_data",
				description: "bitsy file format: plaintext game data"
			});
			tool.menu.push({
				control: "button",
				text: { id: "download_data", text: "save data" },
				icon: "download",
				description: "save game data as .bitsy file",
				onclick: exportGameData
			});
			tool.menu.push({
				control: "file",
				id: "import_data",
				text: "load data", // todo : localize
				icon: "upload",
				description: "load game data from a .bitsy file",
				accept: ".bitsy",
				onload: importGameDataFromFile
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({
				control: "button",
				text: { id: "reset_game", text: "new game" },
				icon: "new_game",
				description: "reset everything and start new game",
				onclick: newGameDialog
			});
		}

		function updateSettingsMenu() {
			updateToolSettings();
			updateGameSettings();
			updateExportSettings();
		}

		function updateDataMenu() {
			// todo : not updating after all changes...
			tool.menu.push({
				control: "textarea",
				description: "raw text of the bitsy game data file (be careful when editing)",
				rows: 26,
				value: serializeWorld(!showFontDataInGameData),
				onchange: function(e) {
					var gamedataChanged = e.target.value;
					Store.set("game_data", gamedataChanged);

					// TODO : is there a better way to handle the global editor update?
					on_game_data_change();
				}
			});
		}

		function exportGame() {
			// make sure game data is up to date
			refreshGameData();
			var gameData = serializeWorld();

			// download as html file
			exporter.exportGame(
				gameData,
				getTitle(),
				exportSettings.pageColor,
				filenameFromGameTitle() + ".html",
				exportSettings.isFixedSize,
				exportSettings.fixedSize);
		}

		function importGameFromFile(fileText) {
			resetGameData();

			var gamedataImported = exporter.importGame(fileText);
			Store.set("game_data", gamedataImported);

			// TODO : is there a better way to handle the global editor update?
			on_game_data_change();
		}

		function exportGameData() {
			refreshGameData();
			var gamedataExported = serializeWorld();
			ExporterUtils.DownloadFile(filenameFromGameTitle() + ".bitsy", gamedataExported);
		}

		function importGameDataFromFile(fileText) {
			resetGameData();

			var gamedataImported = fileText;
			Store.set("game_data", gamedataImported);

			on_game_data_change();
		}

		function newGameDialog() {
			var resetMessage = localization.GetStringOrFallback("reset_game_message", "Starting a new game will erase your old data. Consider exporting your work first! Are you sure you want to start over?");
			// todo : move the confirm dialog into tool.menu code?
			if (confirm(resetMessage)) {
				// todo : move into file.js
				resetGameData();
			}
		}

		function resetGameData() {
			// todo : can this be moved into file.js?
			setDefaultGameState();

			// re-apply language settings
			updateLanguage(localization.GetLanguage());

			on_game_data_change();
		}

		function filenameFromGameTitle() {
			var filename = getTitle().replace(/[^a-zA-Z]/g, "_"); // replace non alphabet characters
			filename = filename.toLowerCase();
			filename = filename.substring(0, 32); // keep it from getting too long
			return filename;
		}

		function updateToolSettings() {
			var languageOptions = [];
			for (var i = 0; i < languageList.length; i++) {
				languageOptions.push({
					text: languageList[i].name,
					description: languageList[i].id,
					value: languageList[i].id,
				});
			}

			tool.menu.push({
				control: "group",
				text: { id: "editor_settings", text: "tool settings" },
				direction: "column",
				expandable: true, // todo : is this redundant now that we have "open"?
				open: isToolSettingsGroupOpen,
				ontoggle: function(e) {
					isToolSettingsGroupOpen = e.target.open;
				}
			});

			tool.menu.push({ control: "group" });
			tool.menu.push({ control: "label", text: "language:" });
			tool.menu.push({
				control: "select",
				name: "languageSelect",
				value: localization.GetLanguage(),
				options: languageOptions,
				onchange: onChangeLanguage,
			});

			tool.menu.push({
				control: "label",
				text: { id: "language_translator_credit" }
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: "show font in game data?",
				description: "font data visibility (does not change what is exported)"
			});
			tool.menu.push({
				control: "toggle",
				id: "font_data_toggle",
				icon: showFontDataInGameData ? "visibility" : "visibility_off",
				text: showFontDataInGameData ? "font data visible" : "font data hidden", // todo : localize
				description: "show / hide font data (WARNING: can be very slow for large fonts)",
				checked: showFontDataInGameData,
				onclick: function(e) {
					showFontDataInGameData = e.target.checked;
				},
			});
			tool.menu.pop({ control: "group" });

			tool.menu.pop({ control: "group" });
		}

		function updateGameSettings() {
			tool.menu.push({
				control: "group",
				text: { id: "game_settings", text: "game settings" },
				direction: "column",
				expandable: true,
				open: isGameSettingsGroupOpen,
				ontoggle: function(e) {
					isGameSettingsGroupOpen = e.target.open;
				}
			});

			var selectedFontValue = fontName; // NOTE: this is a global var from the engine!
			var fontStorage = Store.get('custom_font', null);
			var fontOptions = [
				{
					text: { id: "font_ascii_small", text: "ASCII Small" },
					description: { id: "font_ascii_small_description", text: "Small font limited to ASCII, which includes English characters and some symbols." },
					value: "ascii_small"
				},
				{
					text: { id: "font_unicode_european_small", text: "Unicode European Small" },
					description: { id: "font_unicode_european_small_description", text: "Small font with some unicode support. Includes characters for most European languages." },
					value: "unicode_european_small"
				},
				{
					text: { id: "font_unicode_european_large", text: "Unicode European Large" },
					description: { id: "font_unicode_european_large_description", text: "Large font with more unicode support. Includes characters for all European languages." },
					value: "unicode_european_large"
				},
				{
					text: { id: "font_unicode_asian", text: "Unicode Asian" },
					description: { id: "font_unicode_asian_description", text: "Large font which includes characters for Asian languages such as Chinese, Japanese, and Korean." },
					value: "unicode_asian"
				},
				{
					text: { id: "font_arabic", text: "Arabic" },
					description: { id: "font_arabic_description", text: "Pixel font with Arabic characters" },
					value: "arabic"
				},
			];

			if (fontStorage != null) {
				var customFontOption = {
					text: "Custom Font - " + fontStorage.name, // TODO : localize
					description: { id: "font_custom_description", text: 'Custom font in the ".bitsyfont" format' },
					value: "custom"
				};

				fontOptions.push(customFontOption);

				if (fontName === fontStorage.name) {
					selectedFontValue = "custom";
				}
			}

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: { id: "font_label", text: "font" }
			});
			tool.menu.push({
				control: "select",
				name: "fontSelect",
				value: selectedFontValue,
				options: fontOptions,
				onchange: onChangeFont,
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({ control: "label", text: "font file" }); // todo : localize
			tool.menu.push({
				control: "button",
				icon: "download",
				text: { id: "download_font", text: "save font" },
				description: "save the selected font as a .bitsyfont file",
				onclick: function() {
					exportFont();
				}
			});
			tool.menu.push({
				// todo : can i do this with a button instead??
				control: "file",
				id: "fontFilePicker",
				accept: ".bitsyfont",
				icon: "upload",
				text: { id: "upload_font", text: "load font" },
				description: "load a custom font from a .bitsyfont file",
				onload: importFontFromFile,
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: { id: "text_direction_label", text: "text direction" },
				description: "Option for languages that read right to left"
			});
			tool.menu.push({
				control: "select",
				name: "textDirectionSelect",
				value: textDirection, // NOTE: this is a global var from the engine!
				options: [
					{
						text: { id: "text_direction_ltr", text: "left to right" },
						value: TextDirection.LeftToRight
					},
					{
						text: { id: "text_direction_rtl", text: "right to left" },
						value: TextDirection.RightToLeft
					},
				],
				onchange: function(e) {
					updateEditorTextDirection(e.target.value);
					textDirection = e.target.value;
					refreshGameData();
				}
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: { id: "settings_text_mode", text: "text mode" }
			});
			tool.menu.push({
				control: "select",
				name: "textModeSelect",
				value: flags.TXT_MODE, // NOTE: this is a global var from the engine!
				options: [
					{
						text: { id: "settings_text_hirez", text: "default" },
						description: "2x pixel resolution",
						value: bitsy.TXT_HIREZ
					},
					// todo : not sure I like "chunky"
					{
						text: { id: "settings_text_lorez", text: "chunky" },
						description: "1x pixel resolution",
						value: bitsy.TXT_LOREZ
					},
				],
				onchange: function(e) {
					flags.TXT_MODE = parseInt(e.target.value);
					refreshGameData();
				}
			});
			tool.menu.pop({ control: "group" });

			tool.menu.pop({ control: "group" });
		}

		function updateExportSettings() {
			tool.menu.push({
				control: "group",
				text: "export settings", // TODO : localize
				direction: "column",
				expandable: true,
				open: isExportSettingsGroupOpen,
				ontoggle: function(e) {
					isExportSettingsGroupOpen = e.target.open;
				}
			});

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: { id: "option_page_color", text: "html page color:" }
			});
			tool.menu.push({
				control: "color",
				value: exportSettings.pageColor,
				onchange: function(e) {
					exportSettings.pageColor = e.target.value;
					Store.set("exportSettings", exportSettings);
				},
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				text: { id: "option_window_size", text: "game window size:" }
			});
			tool.menu.push({
				control: "select",
				name: "windowSizeSelect",
				value: exportSettings.isFixedSize ? "fixed" : "full",
				options: [
					{
						icon: "pagesize_full",
						text: { id: "option_full_size", text: "full page" },
						value: "full"
					},
					{
						icon: "pagesize_fixed",
						text: { id: "option_fixed_size", text: "fixed size" },
						value: "fixed"
					},
				],
				onchange: function(e) {
					exportSettings.isFixedSize = (e.target.value === "fixed");
					Store.set("exportSettings", exportSettings);
				},
			});

			if (exportSettings.isFixedSize) {
				tool.menu.push({
					control: "number",
					value: exportSettings.fixedSize,
					onchange: function(e) {
						exportSettings.fixedSize = parseInt(e.target.value);
						Store.set("exportSettings", exportSettings);
					}
				});
			}
			tool.menu.pop({ control: "group" });

			tool.menu.pop({ control: "group" });
		}

		function onChangeLanguage(e) {
			var language = e.target.value;
			updateLanguage(language);
		}

		function updateLanguage(language) {
			pickDefaultFontForLanguage(language);

			localization.ChangeLanguage(language);

			// update title in new language IF the user hasn't made any changes to the default title
			if (localization.LocalizationContains("default_title", getTitle())) {
				setTitle(localization.GetStringOrFallback("default_title", "Write your game's title here"));
			}

			// update default sprite
			var defaultSpriteDlgExists = dialog["0"] != null && localization.LocalizationContains("default_sprite_dlg", dialog["0"]);
			if (defaultSpriteDlgExists) {
				dialog["0"] = {
					src: localization.GetStringOrFallback("default_sprite_dlg", "I'm a cat"),
					name: null,
				};
			}

			// update default item
			var defaultItemDlgExists = dialog["1"] != null && localization.LocalizationContains("default_item_dlg", dialog["1"]);
			if (defaultItemDlgExists) {
				dialog["1"] = {
					src: localization.GetStringOrFallback("default_item_dlg", "You found a nice warm cup of tea"),
					name: null,
				};
			}

			// hacky global editor stuff
			updateEditorLanguageStyle(language);
			updateInventoryUI();
			reloadDialogUI();
			hackUpdatePlaceholderText();
			hackUpdateEditorToolMenusOnLanguageChange();

			refreshGameData();
		}

		function pickDefaultFontForLanguage(lang) {
			if (lang === "en") {
				switchFont("ascii_small", true /*doPickTextDirection*/);
			}
			else if (lang === "ar") {
				switchFont("arabic", true /*doPickTextDirection*/);
			}
			else if (lang === "zh" || lang === "ja") {
				switchFont("unicode_asian", true /*doPickTextDirection*/);
			}
			else {
				switchFont("unicode_european_small", true /*doPickTextDirection*/);
			}
		}

		function switchFont(newFontName, doPickTextDirection) {
			if (doPickTextDirection === undefined || doPickTextDirection === null) {
				doPickTextDirection = false;
			}

			fontName = newFontName;

			if (doPickTextDirection) {
				bitsyLog("PICK TEXT DIR", "editor");
				pickDefaultTextDirectionForFont(newFontName);
			}

			refreshGameData();
		}

		function pickDefaultTextDirectionForFont(newFontName) {
			var newTextDirection = TextDirection.LeftToRight;
			if (newFontName === "arabic") {
				newTextDirection = TextDirection.RightToLeft;
			}
			updateEditorTextDirection(newTextDirection);
			textDirection = newTextDirection;
		}

		function onChangeFont(e) {
			if (e.target.value != "custom") {
				switchFont(e.target.value, true /*doPickTextDirection*/);
			}
			else {
				var fontStorage = Store.get('custom_font', { name: 'ascii_small' });
				switchFont(fontStorage.name, true /*doPickTextDirection*/);
			}
		}

		function exportFont() {
			var fontData = fontManager.GetData(fontName);
			ExporterUtils.DownloadFile(fontName + ".bitsyfont", fontData);
		}

		function importFontFromFile(fileText) {
			bitsyLog(fileText, "editor");

			var customFontName = (fontManager.Create(fileText)).getName();

			fontManager.AddResource(customFontName + fontManager.GetExtension(), fileText);
			switchFont(customFontName); // bitsy engine setting

			var fontStorage = {
				name : customFontName,
				fontdata : fileText
			};
			Store.set('custom_font', fontStorage);

			refreshGameData();
		}
	});
}