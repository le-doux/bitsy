function IconUtils() {
	function GetIconSource(name) {
		return Resources["icon_" + name + ".svg"];
	}

	function LoadIcon(element, name) {
		name = name ? name : element.innerText;
		element.innerHTML = GetIconSource(name);
	}
	this.LoadIcon = LoadIcon;

	this.CreateIcon = function(name) {
		var iconSpan = document.createElement("span");
		iconSpan.classList.add("bitsy_icon");
		LoadIcon(iconSpan, name);
		return iconSpan;
	}
}