/**
 * Interface for classes that represents a Storage Service
 * @interface
 */
var StorageServiceInterface = function () {
	/**
	 * Return true if key item exists, otherwise, false
	 * @param {string} key
	 * @returns {boolean}
	 */
	this.has = function (key) {};
	
	/**
	 * Return the stored item if exists, otherwise, null
	 * @param {string} key
	 * @returns {(object|null)} Object stored or null
	 */
	this.fetch = function (key) {};

	/**
	 * Return true if the item was stored, otherwise, false
	 * @param {string} key
	 * @param {*} value - Stored value
	 * @param {(number|null)} [expiration = null] - Expiration time(miliseconds)
	 * @returns {boolean}
	 */
	this.save = function (key, value, expiration) {
		expiration = expiration || null;
	};

	/**
	 * Return true if the item was deleted, otherwise, false
	 * @param {string} key
	 * @returns {boolean}
	 */
	this.remove = function (key) {};
}