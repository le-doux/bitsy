/* UTILS
miscellaneous utility functions for the editor
TODO: encapsulate in an object maybe? or is that overkill?
*/

function clamp(val, min, max) {
	return Math.max(Math.min(val, max), min);
}