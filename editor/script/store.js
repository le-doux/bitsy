/**
 * ```js
 * // call once
 * Store.init(function onFirstError() {
 * 	// called once when storage fails;
 * 	// use to signal lack of storage to user
 * 	window.alert('Storage is not working!');
 * });
 * // call as needed
 * Store.get('key', 'fallback value');
 * Store.set('key', 'new value');
 * ```
 */
var Store = {
	/** storage driver (must implement `getItem`, `setItem`, `removeItem`) */
	getDriver: function () {
		return localStorage;
	},
	/** whether storage has failed */
	error: false,
	/**
	 * Initializes storage mechanism
	 * @param {(err: Error) => void} [onFirstError] called once when storage fails;
	 * use to signal lack of storage to user
	 */
	init: function (onFirstError) {
		this.onFirstError = function (err) {
			this.error = true;
			console.warn('Storage error', err);
			if (onFirstError) onFirstError(err);
		};
		try {
			// test that storage driver is available and working
			var driver = this.getDriver();
			var testValue = 'test';
			driver.setItem('_test_key_', testValue);
			if (driver.getItem('_test_key_') !== testValue) {
				throw new Error('Storage access fails silently. This might be caused by a browser extension that blocks third-party cookies.');
			}
			driver.removeItem('_test_key_');
		} catch (err) {
			this.onFirstError(err);
		}
	},
	/**
	 * @param {string} name storage key
	 * @param {any} [fallback] value returned if storage fails, or value for key is undefined
	 * @returns {any} stored value for key, or fallback value
	 */
	get: function (name, fallback) {
		try {
			var value = this.getDriver().getItem(name);
			if (typeof value === 'string') {
				try {
					return JSON.parse(value);
				} catch {
					return value;
				}
			}
		} catch (err) {
			if (!this.error && this.onFirstError) {
				this.onFirstError(err);
			}
		}
		return fallback;
	},
	/**
	 * @param {string} name storage key
	 * @param {any} [value] value to store (use `undefined` to clear)
	 */
	set: function (name, value) {
		try {
			if (value === undefined) {
				this.getDriver().removeItem(name);
			} else {
				this.getDriver().setItem(name, JSON.stringify(value));
			}
		} catch (err) {
			if (!this.error && this.onFirstError) {
				this.onFirstError(err);
			}
		}
	},
};
