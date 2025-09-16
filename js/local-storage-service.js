/**
 * Creates a new LocalStorageService
 * @class
 * @implements {StorageServiceInterface}
 */
var LocalStorageService = function () {
	/**
	 * Implements StorageServiceInterface
	 */
	StorageServiceInterface.call(this);

	/**
	 * @property {(object|null)} [lastResponse=null] - Store the last response
	 */
	this.lastResponse = null;

	/**
	 * @property {object} lastError - Store the last error
	 */
	this.lastError = null;

	/**
	 * @constructs LocalStorageService
	 */
	this.setup = function () {
		return this;
	}

	/**
	 * @inheritdoc
	 */
	this.has = function (key) {
		if (!this.hasLocalStorage()) {
			return false;
		} else if (helper.isEmpty(key)) {
			this.lastError = 'No key were supplied for this method';
			return false;
		}

		var hasItem = false;
		try {
			var item = this.formatItem(key, localStorage.getItem(key));
			// If fetched item has been expired
			if (this.expired(item.expiration)) {
				item = this.remove(item.key) ? null : item;
			}

			this.lastResponse = item || this.lastResponse;

			hasItem = item ? true : false;
		} catch (error) {
			this.lastError = error;
		}

		return hasItem;
	};

	/**
	 * @inheritdoc
	 */
	this.fetch = function (key) {
		if (!this.hasLocalStorage()) {
			return false;
		} else if (helper.isEmpty(key)) {
			this.lastError = 'No key were supplied for this method';
			return false;
		}

		var item = null;
		try {
			var tempItem = localStorage.getItem(key);

			// If fetched item exists
			if (tempItem) {
				tempItem = this.formatItem(key, tempItem);

				// If fetched item has been expired
				if (this.expired(tempItem.expiration)) {
					tempItem = this.remove(tempItem.key) ? null : tempItem;
				}

				item = tempItem;
			}

			this.lastResponse = item || this.lastResponse;
		} catch (error) {
			console.error(error);
			this.lastError = error;
		}

		return item;
	};

	/**
	 * @inheritdoc
	 */
	this.save = function (key, value, expiration) {
		if (!this.hasLocalStorage()) {
			return false;
		} else if (helper.isEmpty(key)) {
			this.lastError = 'No key were supplied for this method';
			return false;
		} else if (value == null) {
			this.lastError = 'The value parameter can not be null';
			return false;
		}
		
		expiration = expiration || null;

		var saved = false;
		try {
			var item = this.formatItem(key, value, expiration);
			if (item) {
				item = JSON.stringify(item);
			}

			localStorage.setItem(key, item);
			this.lastResponse = item || this.lastResponse;
			saved = true;
		} catch (error) {
			console.error(error);
			this.lastError = error;
		}

		return saved;
	};

	/**
	 * @inheritdoc
	 */
	this.remove = function (key) {
		if (!this.hasLocalStorage()) {
			return false;
		} else if (helper.isEmpty(key)) {
			this.lastError = 'No key were supplied for this method';
			return false;
		}

		var deleted = true;

		try {
			localStorage.removeItem(key);
		} catch (error) {
			deleted = false;
			this.lastError = error;
		}

		return deleted;
	};

	/**
	 * Return true if 'localStorage' exists, otherwise, false
	 * @returns {boolean}
	 */
	this.hasLocalStorage = function () {
		if (typeof localStorage === 'undefined' || !localStorage) {
			this.lastError = 'There is no localStorage available on this browser';
			return false;
		}

		return true;
	}

	/**
	 * Format and return an item
	 * @param {string} key 
	 * @param {*} value
	 * @param {(number|null)} [expiration = null] - Expiration time(miliseconds)
	 * @return {({key: string, value: *, expiration: number}|null)} - Return a formatted item
	 */
	this.formatItem = function (key, value, expiration) {
		if (helper.isEmpty(key) || value == null) {
			return null;
		}

		try {
			value = JSON.parse(value);
			if (this.isStorageItem(value)) {
				return value;
			}
		} catch (error) {
			this.lastError = error;
		}

		expiration = expiration || null;
		if (helper.isNumeric(expiration)) {
			expiration = Date.now() + expiration;
		}

		var item = {
			key: key,
			value: value,
			expiration: expiration
		}

		return item;
	}

	/**
	 * Return true if item is a StorageItem, otherwise, false
	 * @param {object} item 
	 * @returns {boolean}
	 */
	this.isStorageItem = function (item) {
		if (helper.isEmpty(item)) {
			this.lastError = 'No item has been provided';
			return false;
		} else if (!('key' in item) || !('value' in item) || !('expiration' in item)) {
			this.lastError = 'Item provided is not a StorageItem';
			return false;
		}

		return true;
	}

	/**
	 * Return true if the param has been expired, otherwise, false
	 * @param {number} expiration
	 * @returns {boolean}
	 */
	this.expired = function(expiration) {
		if (!helper.isNumeric(expiration)) {
			return false;
		} else if (!(Date.now() > expiration)) {
			return false;
		}

		return true;
	}
}

/**
 * Assign the StorageServiceInterface prototype
 */
LocalStorageService.prototype = Object.create(StorageServiceInterface.prototype);

/**
 * Assign the LocalStorageService.setup() method as prototype constructor
 */
LocalStorageService.prototype.constructor = (new LocalStorageService()).setup();
