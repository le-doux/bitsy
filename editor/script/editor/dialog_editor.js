/*
DIALOG SCRIPTING EDITOR

TODO: encapsulate this stuff!

TODO
- delete blocks
- re-serialize on change
- delete sequence options
- add sequence options
- change if conditions
- delete if conditions
- add if conditions
- add blocks
*/

function createIconElement(iconName) {
	var icon = document.createElement("i");
	icon.classList.add('material-icons');
	icon.innerText = iconName;
	return icon;
}

var dialogSel = {
	target : null,
	start : 0,
	end : 0,
	onchange : null
}

function createOnTextSelectionChange(onchange) {
	return function(event) {
		dialogSel.target = event.target;
		dialogSel.start = event.target.selectionStart;
		dialogSel.end = event.target.selectionEnd;
		dialogSel.onchange = onchange;

		var effectButtons = document.getElementsByClassName("dialogEffectButton");
		for(var i = 0; i < effectButtons.length; i++) {
			effectButtons[i].disabled = false;
		}
	}
}

function onTextSelectionLeave(event) {
	dialogSel.target = null;
	dialogSel.start = 0;
	dialogSel.end = 0;

	var effectButtons = document.getElementsByClassName("dialogEffectButton");
	for(var i = 0; i < effectButtons.length; i++) {
		effectButtons[i].disabled = true;
	}
}

function preventTextDeselect(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
	}
}

function preventTextDeselectAndClick(event) {
	if(dialogSel.target != null) {
		// event.preventDefault();
		event.target.click();
	}
}

function wrapTextSelection(effect) {
	if( dialogSel.target != null ) {
		var curText = dialogSel.target.value;
		var selText = curText.slice(dialogSel.start, dialogSel.end);

		var isEffectAlreadyApplied = selText.indexOf( effect ) > -1;
		if(isEffectAlreadyApplied) {
			//remove all instances of effect
			var effectlessText = selText.split( effect ).join( "" );
			var newText = curText.slice(0, dialogSel.start) + effectlessText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectlessText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
		else {
			// add effect
			var effectText = effect + selText + effect;
			var newText = curText.slice(0, dialogSel.start) + effectText + curText.slice(dialogSel.end);
			dialogSel.target.value = newText;
			dialogSel.target.setSelectionRange(dialogSel.start,dialogSel.start + effectText.length);
			if(dialogSel.onchange != null)
				dialogSel.onchange( dialogSel ); // dialogSel needs to mimic the event the onchange would usually receive
		}
	}
}

function ConvertNumberStringToArabic(numberString) {
	var arabicNumerals = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];

	var arabicNumberString = "";

	for (var i = 0; i < numberString.length; i++)
	{
		arabicNumberString += arabicNumerals[parseInt(numberString[i])];
	}

	return arabicNumberString;
}

var DialogBlockUI = function(nodes, num) {
	var dialogNode = scriptUtils.CreateDialogBlock( nodes );

	var div = document.createElement('div');
	div.classList.add('controlBox');

	if(dialogNode.children.length > 0) {
		dialogNode.children[0].onEnter = function() {
			div.classList.add('highlighted');
		}
		dialogNode.children[dialogNode.children.length-1].onExit = function() {
			div.classList.remove('highlighted');
		}
	}
	// console.log( dialogNode.children[dialogNode.children.length-1] );

	var topDiv = document.createElement('div');
	topDiv.classList.add('advDialogTop');
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("subject");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_basic", "dialog");
	typeEl.title = "this dialog is said once on each interaction";
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this dialog section";
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	var textArea = document.createElement("textarea");
	function onChangeDialogBlock() {
		dialogNode = scriptInterpreter.Parse( '"""\n' +  textArea.value + '\n"""' );
		nodes = dialogNode.children;
		console.log(nodes);

		if(dialogNode.children.length > 0) {
			dialogNode.children[0].onEnter = function() {
				div.classList.add('highlighted');
			}
			dialogNode.children[dialogNode.children.length-1].onExit = function() {
				div.classList.remove('highlighted');
			}
		}

		serializeAdvDialog();
	}
	textArea.classList.add('advDialogTextBlock');
	textArea.classList.add('gameTextDir');
	textArea.value = dialogNode.Serialize();
	textArea.addEventListener('change', onChangeDialogBlock);
	textArea.addEventListener('keyup', onChangeDialogBlock);
	var textChangeHandler = createOnTextSelectionChange( onChangeDialogBlock );
	textArea.addEventListener('click', textChangeHandler);
	textArea.addEventListener('select', textChangeHandler);
	textArea.addEventListener('blur', textChangeHandler);
	textArea.title = "type dialog here";
	div.appendChild( textArea );

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return nodes;
	}
}

// TODO : rename everything something more sensible
var IfBlockUI = function(node, num) {
	var ifNode = node.children[0];

	function createOnChangeResult(index) {
		return function(event) {
			ifNode.results[index] = scriptInterpreter.Parse( '"""\n' + event.target.value + '\n"""' );
			serializeAdvDialog();
		}
	}

	var div = document.createElement('div');
	div.classList.add('controlBox');

	node.onEnter = function() {
		div.classList.add('highlighted');
	}
	node.onExit = function() {
		div.classList.remove('highlighted');
	}

	var topDiv = document.createElement('div');
	topDiv.classList.add('advDialogTop');
	// topDiv.style.marginBottom = "5px";
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("call_split");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );
	// topDiv.appendChild( createIconElement("call_split") );
	// div.appendChild( createIconElement("help_outline") );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_conditional", "conditional");
	typeEl.title = "which dialog option is said is determined by conditions you define"
	leftSpan.appendChild( typeEl );

	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this conditional dialog section"
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	function createOnDelete(index) {
		var onDelete = function() {
			ifNode.conditions.splice(index,1);
			ifNode.results.splice(index,1);
			serializeAdvDialog();
			reloadAdvDialogUI();	
		};
		return onDelete;
	}

	var conditionTypes = ["item","variable","default","custom"];
	var conditionTypeNames = [
		localization.GetStringOrFallback("item_label", "item"),
		localization.GetStringOrFallback("variable_label", "variable"),
		localization.GetStringOrFallback("condition_type_default", "default"),
		localization.GetStringOrFallback("condition_type_custom", "custom")
	];
	// var conditionTypesVerbose = ["the player's inventory of the item", "the value of the variable", "no other condition is met (default)", "a custom condition is met"]
	// var comparisonNames = ["equals","greater than","less than","greater than or equal to","less than or equal to"];
	var comparisonTypes = ["==", ">", "<", ">=", "<="];
	// var comparisonTypesVerbose = ["is equal to", "is greater than", "is less than", "is greater than or equal to", "is less than or equal to"];
	// NOTE: verbose names seemed too hard to understand

	function createOnConditionTypeChange(index, condItemSelect, condVariableSelect, condCompareSelect, condValueInput, condCustomTextInput) {
		return function(event) {
			console.log("CHANGE CONDITIONAL TYPE " + event.target.value);

			var condition = ifNode.conditions[index];

			condItemSelect.style.display = "none";
			condVariableSelect.style.display = "none";
			condCompareSelect.style.display = "none";
			condValueInput.style.display = "none";
			condCustomTextInput.style.display = "none";

			var doesConditionMatchUI = event.target.value === getConditionType( condition );

			if(event.target.value === "item") { // TODO: negative numbers don't work
				condItemSelect.style.display = "inline";
				condCompareSelect.style.display = "inline";
				condValueInput.style.display = "inline";

				if(doesConditionMatchUI) {
					var itemId = condition.left.children[0].arguments[0].value;
					if(names.item.has(itemId)) itemId = names.item.get(itemId);
					condItemSelect.value = itemId;

					var operator = condition.operator;
					condCompareSelect.value = operator;

					var compareVal = condition.right.value;
					condValueInput.value = compareVal;
				}
				else {
					var itemId = condItemSelect.value;
					if(item[itemId].name != null) itemId = item[itemId].name;
					var condStr = '{item "' + itemId + '"} ' + condCompareSelect.value + ' ' + condValueInput.value;
					console.log(condStr);
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "variable") {
				condVariableSelect.style.display = "inline";
				condCompareSelect.style.display = "inline";
				condValueInput.style.display = "inline";

				if(doesConditionMatchUI) {
					console.log("VAR MATCH");
					var varId = condition.left.name;
					console.log(varId);
					condVariableSelect.value = varId;

					var operator = condition.operator;
					condCompareSelect.value = operator;

					var compareVal = condition.right.value;
					condValueInput.value = compareVal;
				}
				else {
					var varId = condVariableSelect.value;
					var condStr = varId + ' ' + condCompareSelect.value + ' ' + condValueInput.value;
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "default") {
				if(!doesConditionMatchUI) {
					ifNode.conditions[index] = scriptInterpreter.CreateExpression( "else" );
					serializeAdvDialog();
				}
			}
			else if(event.target.value === "custom") {
				condCustomTextInput.style.display = "inline";

				// custom conditions can contain anything so no need to change the existing condition
				condCustomTextInput.value = condition.Serialize();
			}
		}
	};

	function createOnConditionPartialChange(index, condTypeSelect, condItemSelect, condVariableSelect, condCompareSelect, condValueInput) {
		return function() {
			if(condTypeSelect.value === "item") {
				var itemId = condItemSelect.value;
				if(item[itemId].name != null) itemId = item[itemId].name;
				var condStr = '{item "' + itemId + '"} ' + condCompareSelect.value + ' ' + condValueInput.value;
				ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
				serializeAdvDialog();
			}
			else if(condTypeSelect.value === "variable") {
				var varId = condVariableSelect.value;
				var condStr = varId + ' ' + condCompareSelect.value + ' ' + condValueInput.value;
				ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
				serializeAdvDialog();
			}
		}
	}

	function createOnConditionCustomChange(index, condCustomTextInput) {
		return function() {
			var condStr = condCustomTextInput.value;
			ifNode.conditions[index] = scriptInterpreter.CreateExpression( condStr );
			serializeAdvDialog();
		}
	}

	function getConditionType(condition) {
		if(condition.type === "else") {
			return "default";
		}
		else if(condition.type === "operator") {
			if (condition.right.type === "literal" && !isNaN(condition.right.value)) {
				if(condition.left.type === "block") {
					var child = condition.left.children[0];
					if(child.type === "function" && child.name === "item") {
						return "item";
					}
				}
				if(condition.left.type === "variable" && variable[condition.left.name] != null) {
					return "variable";
				}
			}
		}
		return "custom";
	}

	var addConditionEl = document.createElement("button");
	addConditionEl.title = "add a new dialog option to this conditional dialog section"
	addConditionEl.appendChild( createIconElement("add") );
	var addConditionText = document.createElement("span");
	addConditionText.innerText = localization.GetStringOrFallback("dialog_conditional_add", "add option");
	addConditionEl.appendChild( addConditionText );

	function addCondition(condition, result, index) {
		var conditionDiv = document.createElement('div');
		conditionDiv.style.display = "block";
		conditionDiv.classList.add('advDialogConditionDiv');
		div.insertBefore( conditionDiv, addConditionEl );

		var condInnerDiv = document.createElement("div");
		// condInnerDiv.style.overflow = "none";
		condInnerDiv.style.width = "300px";
		// condInnerDiv.style.background = "red";
		condInnerDiv.style.whiteSpace = "normal";
		conditionDiv.appendChild(condInnerDiv);

		// var subNumSpan = document.createElement("div");
		// subNumSpan.innerText = num + numToLetter(index) + ". ";
		// subNumSpan.style.fontSize = "12px";
		// subNumSpan.style.display = "inline";
		// condInnerDiv.appendChild( subNumSpan );


		// // new experiment
		// var deleteConditionEl = document.createElement("button");
		// deleteConditionEl.appendChild( createIconElement("clear") );
		// deleteConditionEl.addEventListener( 'click', createOnDelete(index) );
		// deleteConditionEl.title = "delete this option from this conditional dialog section"
		// condInnerDiv.appendChild( deleteConditionEl );
		// condInnerDiv.appendChild( document.createElement("br") );


		var condSpan = document.createElement("span");
		condSpan.innerText = localization.GetStringOrFallback("dialog_conditional_when", "when") + " ";
		condSpan.title = "define the condition for which this dialog option is said";
		condInnerDiv.appendChild(condSpan);
		var condTypeSelect = document.createElement("select");
		condTypeSelect.title = "choose type of condition to check";
		condInnerDiv.appendChild(condTypeSelect);
		for(var i = 0; i < conditionTypes.length; i++) {
			var condTypeOption = document.createElement("option");
			condTypeOption.value = conditionTypes[i];
			condTypeOption.innerText = conditionTypeNames[i];
			condTypeSelect.appendChild(condTypeOption);
		}
		// condInnerDiv.appendChild( document.createElement("br") );
		var condItemSelect = document.createElement("select");
		condItemSelect.title = "choose item to check";
		condInnerDiv.appendChild(condItemSelect);
		for(id in item) {
			var condItemOption = document.createElement("option");
			condItemOption.value = id;
			condItemOption.innerText = (item[id].name != null ? item[id].name : localization.GetStringOrFallback("item_label", "item") + " " + id);
			condItemSelect.appendChild(condItemOption);
		}
		var condVariableSelect = document.createElement("select");
		condVariableSelect.title = "choose variable to check";
		condInnerDiv.appendChild(condVariableSelect);
		for(id in variable) {
			var condVariableOption = document.createElement("option");
			condVariableOption.value = id;
			condVariableOption.innerText = id;
			condVariableSelect.appendChild(condVariableOption);
		}
		// var condSpan2 = document.createElement("span");
		// condSpan2.innerText = " is ";
		// condInnerDiv.appendChild(condSpan2);
		var condCompareSelect = document.createElement("select");
		condCompareSelect.title = "choose a comparison type";
		condInnerDiv.appendChild(condCompareSelect);
		for(var i = 0; i < comparisonTypes.length; i++) {
			var condCompareOption = document.createElement("option");
			condCompareOption.value = comparisonTypes[i];
			condCompareOption.innerText = comparisonTypes[i];
			condCompareSelect.appendChild(condCompareOption);
		}
		var condValueInput = document.createElement("input");
		condValueInput.type = "number";
		condValueInput.title = "choose number to compare";
		condValueInput.value = 1;
		condValueInput.style.width = "15%";
		condValueInput.style.fontSize = "100%";
		condInnerDiv.appendChild(condValueInput);
		var condCustomTextInput = document.createElement("input");
		condCustomTextInput.type = "text";
		condCustomTextInput.placeholder = 'ex: x+1 < {item "1"}';
		condCustomTextInput.title = "type custom condition here";
		condInnerDiv.appendChild(condCustomTextInput);

		var onConditionTypeChange = createOnConditionTypeChange(index,condItemSelect,condVariableSelect,condCompareSelect,condValueInput,condCustomTextInput);
		condTypeSelect.addEventListener( 'change', onConditionTypeChange );
		var fakeEvent = { target : { value : getConditionType( condition ) } };
		onConditionTypeChange( fakeEvent );
		condTypeSelect.value = getConditionType( condition );

		var onConditionPartialChange = createOnConditionPartialChange(index,condTypeSelect,condItemSelect,condVariableSelect,condCompareSelect,condValueInput);
		condItemSelect.addEventListener( 'change', onConditionPartialChange );
		condVariableSelect.addEventListener( 'change', onConditionPartialChange );
		condCompareSelect.addEventListener( 'change', onConditionPartialChange );
		condValueInput.addEventListener( 'change', onConditionPartialChange );

		var onConditionCustomChange = createOnConditionCustomChange(index,condCustomTextInput);
		condCustomTextInput.addEventListener('change', onConditionCustomChange);
		condCustomTextInput.addEventListener('keyup', onConditionCustomChange);
		condCustomTextInput.addEventListener('keydown', onConditionCustomChange);

		// var hr = document.createElement("hr");
		// hr.classList.add('niceHr');
		// conditionDiv.appendChild(hr);
		// var condSaySpan = document.createElement("span");
		// condSaySpan.innerText = "say: ";
		// conditionDiv.appendChild(condSaySpan);
		// conditionDiv.appendChild( document.createElement("br") );

		var textArea = document.createElement("textarea");
		textArea.classList.add('advDialogTextOption');
		textArea.classList.add('gameTextDir');
		textArea.value = result.Serialize();
		var onChangeResult = createOnChangeResult(index);
		textArea.addEventListener('change', onChangeResult);
		textArea.addEventListener('keyup', onChangeResult);
		textArea.addEventListener('keydown', onChangeResult);
		var textChangeHandler = createOnTextSelectionChange( onChangeResult );
		textArea.addEventListener('click', textChangeHandler);
		textArea.addEventListener('select', textChangeHandler);
		textArea.addEventListener('blur', textChangeHandler);
		textArea.title = "type dialog option to say when this condition is true"
		textArea.style.display = "inline-block";
		conditionDiv.appendChild( textArea );
		// div.appendChild( document.createElement("br") );

		var deleteConditionEl = document.createElement("button");
		deleteConditionEl.appendChild( createIconElement("clear") );
		deleteConditionEl.addEventListener( 'click', createOnDelete(index) );
		deleteConditionEl.title = "delete this option from this conditional dialog section"
		conditionDiv.appendChild( deleteConditionEl );
	}

	addConditionEl.addEventListener('click', function() {
		var newCondition = scriptInterpreter.CreateExpression('{item "0"} == 1');
		var newResult = scriptUtils.CreateDialogBlock([]);
		ifNode.conditions.push( newCondition );
		ifNode.results.push( newResult );
		addCondition(newCondition, newResult, ifNode.conditions.length-1);
		serializeAdvDialog();
	});
	div.appendChild(addConditionEl);

	for(var j = 0; j < ifNode.conditions.length; j++) {
		addCondition( ifNode.conditions[j], ifNode.results[j], j );
	}

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return [node];
	}
}

var seqRadioCount = 0;
var SeqBlockUI = function(node, num) {
	var sequenceNode = node.children[0];

	function createOnChangeOption(index) {
		return function(event) {
			sequenceNode.options[index] = scriptUtils.CreateDialogBlock( scriptInterpreter.Parse( '"""\n' + event.target.value + '\n"""' ).children, false ); // hacky way to avoid indenting first line (think of something better please!)
			serializeAdvDialog();
		}
	}

	var div = document.createElement('div');
	div.classList.add('controlBox');

	node.onEnter = function() {
		div.classList.add('highlighted');
	}
	node.onExit = function() {
		div.classList.remove('highlighted');
	}

	var topDiv = document.createElement('div');
	// topDiv.style.background = "red";
	topDiv.classList.add('advDialogTop');
	topDiv.style.marginBottom = "5px";
	div.appendChild(topDiv);

	var leftSpan = document.createElement('span');
	leftSpan.classList.add('advDialogBlockName');
	topDiv.appendChild(leftSpan);

	var topIcon = createIconElement("list");
	topIcon.classList.add('advDialogIcon');
	leftSpan.appendChild( topIcon );

	var numSpan = document.createElement("span");
	var numString = "" + num;
	if (localization.GetLanguage() === "ar") { // arabic
		numString = ConvertNumberStringToArabic(numString);
	}
	numSpan.innerText = numString + ". ";
	leftSpan.appendChild( numSpan );

	var typeEl = document.createElement("span");
	typeEl.innerText = localization.GetStringOrFallback("dialog_block_list", "list");
	typeEl.title = "one line of dialog in the list is said on each interaction, in the order you choose";
	leftSpan.appendChild( typeEl );
	
	//
	var deleteEl = document.createElement("button");
	deleteEl.appendChild( createIconElement("clear") );
	deleteEl.classList.add('light');
	deleteEl.classList.add('advDialogBlockDelete');
	var self = this; // hack
	deleteEl.addEventListener('click', function() {
		var i = advDialogUIComponents.indexOf(self);
		if(i>-1) {
			console.log("DELETE SEQ " + i);
			advDialogUIComponents.splice( i, 1 );
			serializeAdvDialog();
			reloadAdvDialogUI();
		}
	});
	deleteEl.title = "delete this dialog list section";
	topDiv.appendChild( deleteEl );

	// div.appendChild( document.createElement("br") );

	var orderEl = document.createElement("span");
	orderEl.innerText = localization.GetStringOrFallback("dialog_list_order", "order:") + " ";
	orderEl.title = "select the order in which lines are said";
	div.appendChild( orderEl );

	// var formEl = document.createElement("form");
	// div.appendChild( formEl );
	var selectEl = document.createElement("select");
	selectEl.addEventListener('change', function(event) {
		sequenceNode = scriptUtils.ChangeSequenceType( sequenceNode, event.target.value );
		node.children[0] = sequenceNode;
		serializeAdvDialog();
	});
	div.appendChild(selectEl);
	var sequenceTypes = ["sequence","cycle","shuffle"];
	var sequenceDesc = [
		localization.GetStringOrFallback("list_type_description_sequence", "sequence (say each line once)"),
		localization.GetStringOrFallback("list_type_description_cycle", "cycle (say each line, then repeat)"),
		localization.GetStringOrFallback("list_type_description_shuffle", "shuffle (say lines in random order)")
	];
	for(var i = 0; i < sequenceTypes.length; i++) {
		var optionEl = document.createElement("option");
		optionEl.value = sequenceTypes[i];
		optionEl.innerText = sequenceDesc[i];
		optionEl.selected = (sequenceNode.type === sequenceTypes[i]);
		selectEl.appendChild( optionEl );
	}
	selectEl.title = "select the order in which lines are said";
	seqRadioCount++;

	// div.appendChild( document.createElement("br") );

	var addOptionEl = document.createElement("button");
	// addOptionEl.innerText = "add";
	addOptionEl.appendChild( createIconElement("add") );
	var addOptionText = document.createElement("span");
	addOptionText.innerText = localization.GetStringOrFallback("dialog_list_add", "add line");
	addOptionEl.title = "add a new line of dialog to the list";
	addOptionEl.appendChild( addOptionText );

	function addOption(option,index) {
		var optionDiv = document.createElement('div');
		optionDiv.style.display = "block";
		optionDiv.classList.add('advDialogOptionDiv');
		div.insertBefore( optionDiv, addOptionEl );

		// var subNumSpan = document.createElement("div");
		// subNumSpan.innerText = num + numToLetter(index) + ". ";
		// // subNumSpan.style.background = "black";
		// subNumSpan.style.fontSize = "12px";
		// subNumSpan.style.display = "block";
		// // subNumSpan.style.verticalAlign = "middle";
		// // subNumSpan.style.height = "20px";
		// // subNumSpan.style.float = "left";
		// // subNumSpan.style.position = "relative";
		// // subNumSpan.style.top = "-20px";
		// // subNumSpan.style.lineHeight = "100%";
		// // subNumSpan.style.height = "10px";
		// // subNumSpan.style.marginTop = "-30px";
		// optionDiv.appendChild( subNumSpan );

		var textArea = document.createElement("textarea");
		textArea.classList.add('advDialogTextOption');
		textArea.classList.add('gameTextDir');
		textArea.value = option.Serialize();
		// textArea.style.float = "left";
		var onChangeOption = createOnChangeOption( index );
		textArea.addEventListener('change', onChangeOption);
		textArea.addEventListener('keyup', onChangeOption);
		textArea.addEventListener('keydown', onChangeOption);
		var textChangeHandler = createOnTextSelectionChange( onChangeOption );
		textArea.addEventListener('click', textChangeHandler);
		textArea.addEventListener('select', textChangeHandler);
		textArea.addEventListener('blur', textChangeHandler);
		textArea.title = "type line of dialog here"
		// textArea.style.float = "left";
		// div.insertBefore( textArea, addOptionEl );
		textArea.style.display = "inline-block";
		optionDiv.appendChild( textArea );

		var deleteOptionEl = document.createElement("button");
		// deleteOptionEl.innerText = "delete";
		deleteOptionEl.appendChild( createIconElement("clear") );
		// deleteOptionEl.style.float = "right";
		// deleteOptionEl.classList.add('light');
		deleteOptionEl.addEventListener('click', function() {
			sequenceNode.options.splice(index,1);
			serializeAdvDialog();
			reloadAdvDialogUI();
		});
		deleteOptionEl.title = "delete this line from this list"
		// div.insertBefore( deleteOptionEl, addOptionEl );
		optionDiv.appendChild( deleteOptionEl );

		// div.insertBefore( document.createElement("br"), addOptionEl );
	}
	addOptionEl.addEventListener('click', function() {
		var newOption = scriptUtils.CreateDialogBlock([], false);
		sequenceNode.options.push( newOption );
		addOption(newOption, sequenceNode.options.length-1);
		serializeAdvDialog();
	});
	div.appendChild(addOptionEl);

	for(var j = 0; j < sequenceNode.options.length; j++) {
		addOption( sequenceNode.options[j], j );
	}

	this.GetEl = function() {
		return div;
	}

	this.GetScriptNodes = function() {
		return [node];
	}
}

function numToLetter(num) {
	var str = "";
	var base26 = num.toString(26);
	for(var i = 0; i < base26.length; i++) {
		var base10digit = parseInt( base26[i], 26 );
		var char = String.fromCharCode(97 + base10digit + (i < base26.length-1 ? -1 : 0));
		str += char;
	}
	return str;
}

var advDialogUIComponents = [];

function addDownArrowToDialogFlow() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	if(advDialogUIComponents.length > 0) {
		var iconDiv = document.createElement("div");
		iconDiv.align = "center";
		// iconDiv.style.background = "red";
		// iconDiv.style.margin = "0px";

		var iconEl = createIconElement("arrow_downward");
		iconEl.style.fontSize = "100%";
		iconEl.style.marginBottom = "5px";
		// iconEl.classList.add("downArrowDialog");
		iconDiv.appendChild(iconEl);

		dialogFormDiv.appendChild( iconDiv );
	}
}

function addDialogBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new DialogBlockUI( [], advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function addSeqBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new SeqBlockUI( scriptUtils.CreateSequenceBlock(), advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function addIfBlockUI() {
	var dialogFormDiv = document.getElementById("advDialogViewport");

	addDownArrowToDialogFlow();

	var block = new IfBlockUI( scriptUtils.CreateIfBlock(), advDialogUIComponents.length+1 );
	dialogFormDiv.appendChild( block.GetEl() );

	advDialogUIComponents.push( block );

	serializeAdvDialog();
}

function serializeAdvDialog() {
	console.log("SERIALIZE ADVANCED DIALOG");

	var dialogId = getCurDialogId();
	console.log("SERIALIZE DIALOG " + dialogId);

	var allNodes = [];
	for(var i = 0; i < advDialogUIComponents.length; i++) {
		allNodes = allNodes.concat( advDialogUIComponents[i].GetScriptNodes() );
	}
	var scriptRoot = scriptUtils.CreateDialogBlock( allNodes );

	var dialogStr = scriptRoot.Serialize();
	if( dialogStr.length <= 0 )
	{
		paintTool.getCurObject().dlg = null;
		delete dialog[dialogId];
	}
	else
	{
		if( dialogStr.indexOf("\n") > -1 )
			dialogStr = '"""\n' + dialogStr + '\n"""';

		previewDialogScriptTree = scriptRoot; // scriptInterpreter.Parse( dialogStr ); // hacky

		if(!dialogId) {
			var prefix = (drawing.type == TileType.Item) ? "ITM_" : "SPR_";
			dialogId = nextAvailableDialogId( prefix );
			paintTool.getCurObject().dlg = dialogId;
		}

		dialog[dialogId] = dialogStr;
	}

	reloadDialogUICore();
	document.getElementById("dialogCodeText").value = document.getElementById("dialogText").value;
	refreshGameData();
}

function createAdvDialogEditor(scriptTree) {
	console.log("~~~ ADVANCED DIALOG EDITOR ~~~");

	advDialogUIComponents = [];
	seqRadioCount = 0;

	function isBlock(node) { return node.type === "block"; };
	function isChildType(node,type) { return node.children[0].type === type; };
	function isIf(node) { return isBlock(node) && isChildType(node,"if") && !node.children[0].IsSingleLine(); };
	function isSeq(node) { return isBlock(node) && (isChildType(node,"sequence") || isChildType(node,"cycle") || isChildType(node,"shuffle")); };

	var dialogFormDiv = document.getElementById("advDialogViewport");
	dialogFormDiv.innerHTML = "";

	var textBlockNodes = [];
	function addText() {
		if(textBlockNodes.length > 0) {
			console.log("TEXT BLOCK!!");

			addDownArrowToDialogFlow();

			var b = new DialogBlockUI( textBlockNodes, advDialogUIComponents.length+1 );
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );

			textBlockNodes = [];
		}
	}

	for (var i = 0; i < scriptTree.children.length; i++) {
		var node = scriptTree.children[i];
		if( isIf(node) ) {
			addText();

			// TODO
			console.log("IF NODE!!");
			// console.log(node.Serialize());

			addDownArrowToDialogFlow();

			var b = new IfBlockUI(node, advDialogUIComponents.length+1);
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );

		}
		else if( isSeq(node) ) {
			addText();

			// TODO
			console.log("SEQ NODE!!");

			addDownArrowToDialogFlow();

			var b = new SeqBlockUI(node, advDialogUIComponents.length+1);
			dialogFormDiv.appendChild( b.GetEl() );

			advDialogUIComponents.push( b );
		}
		else {
			textBlockNodes.push( node );
		}
	}

	addText();
}