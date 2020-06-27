function IconUtils() {
	function GetIconSource(name, frame) {
		var fileName = "icon_" + name + (frame ? ("_f" + frame) : "") + ".svg";
		return Resources[fileName];
	}

	function LoadIcon(element, name, frame) {
		name = name ? name : element.innerText;
		element.innerHTML = GetIconSource(name, frame);
	}
	this.LoadIcon = LoadIcon;

	this.CreateIcon = function(name, frame) {
		var iconSpan = document.createElement("span");
		iconSpan.classList.add("bitsy_icon");
		LoadIcon(iconSpan, name, frame);
		return iconSpan;
	}

	this.LoadIconAnimated = function(element) {
		var name = element.innerText;

		var iconFrame0 = this.CreateIcon(name, 0);
		iconFrame0.classList.add("icon_anim_frame0");

		var iconFrame1 = this.CreateIcon(name, 1);
		iconFrame1.classList.add("icon_anim_frame1");

		element.innerHTML = "";
		element.appendChild(iconFrame0);
		element.appendChild(iconFrame1);

		element.classList.add("icon_anim0");
		element.classList.remove("icon_anim1");

		// TODO : I should really do something about the fact that 
		// once this interval is created, it's *never* destroyed
		setInterval(
			function() {
				element.classList.toggle("icon_anim0");
				element.classList.toggle("icon_anim1");
			}, 500);
	}
}