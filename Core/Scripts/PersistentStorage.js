/**
 * An object which will serialise another object into a string and then save it into the LocalStorage
 * @class
 */
function PersistentStorage() {

    var self = this;

    /**
     * the currently watched object
     * @type {Object}
     * @instance
     */
    this._watchedObject = null;

    /**
     * The number of seconds between each save
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.delayBetweenSaves = ko.observable(PersistentStorage.defaultTimeBetweenSaves);

    /**
     * The path which the saved object will be stored under inside LocalStorage
     * @type {String}
     * @instance
     */
    this._storagePath = null;

    /**
     * The date that the last object was saved on
     * @type {KnockoutObservable<Date>}
     */
    this.lastSavedOn = ko.observable(null);
    
    /**
     * Calculates the number of seconds since the last object was saved
     * @instance
     * @type {KnockoutComputed<Number>}
     */
    this.secondsSinceLastSave = ko.computed(function () {

        if (self.lastSavedOn() == null) {

            return Number.MAX_VALUE;
        }

        var millisecondsSinceLastSave = new Date().getTime() - self.lastSavedOn().getTime();
        var secondsSinceLastSave = millisecondsSinceLastSave / 1000;

        return secondsSinceLastSave;
    })
}

/**
 * Sets the default number of seconds between saves, when none have been set by the player
 * @type {Number}
 */
PersistentStorage.defaultTimeBetweenSaves = 1;

/**
 * Creates a new PersistentStorage
 * @param {String} storagePath - The path which the saved object will be stored under inside LocalStorage
 * @returns {PersistentStorage}
 */
PersistentStorage.create = function(storagePath) {

    var persistentStorage = new PersistentStorage();

    persistentStorage._storagePath = storagePath;
    persistentStorage.delayBetweenSaves(PersistentStorage.defaultTimeBetweenSaves);

    return persistentStorage;
}

/**
 * Restores a PersistentStorage from JSON
 * @param {Object} savedPersistentStorage
 * @param {String} storagePath - The path which the saved object will be stored under inside LocalStorage
 * @returns {PersistentStorage}
 */
PersistentStorage.restore = function (savedPersistentStorage, storagePath) {

    if (typeof (savedPersistentStorage) === "undefined" || savedPersistentStorage === null) {

        return null;
    }

    var persistentStorage = new PersistentStorage();

    persistentStorage._storagePath = storagePath;
    persistentStorage.delayBetweenSaves(savedPersistentStorage.delayBetweenSaves ?? PersistentStorage.defaultTimeBetweenSaves);
    persistentStorage.lastSavedOn(new Date(savedPersistentStorage.lastSavedOn != null ? savedPersistentStorage.lastSavedOn : 0));

    return persistentStorage;
}

/**
 * Converts the current object into JSON
 * @instance
 * @returns {Object}
 */
PersistentStorage.prototype.toJSON = function() {

    return {

        delayBetweenSaves: this.delayBetweenSaves(),
        lastSavedOn: this.lastSavedOn() !== null ? this.lastSavedOn().toISOString() : null
    };
}

/**
 * Converts the current object into JSON
 * @param {Object} savedObject - The object which will be converted into JSON
 * @returns {Object}
 */
PersistentStorage.prototype.getObjectAsJSON = function (savedObject) {

    if (savedObject === null || typeof(savedObject.toJSON) === "undefined") {
        
        return null;
    }

    var jsonObject = savedObject.toJSON();
    var objectKeys = Object.keys(jsonObject);

    for (var keyIndex = 0; keyIndex < objectKeys.length; keyIndex++) {

        var key = objectKeys[keyIndex];

        if (jsonObject[key] instanceof Function) {

            jsonObject[key] = this.getObjectAsJSON(jsonObject[key]);
        } 
    }

    return jsonObject;
}

/**
 * Saves the current object to the LocalStorage
 * @param {Object} savedObject - The object which will be saved
 * @instance
 */
PersistentStorage.prototype.saveToLocalStorage = function (savedObject) {

    this.lastSavedOn(new Date());

    var jsonObject = this.getObjectAsJSON(savedObject);

    if (jsonObject === null) {

        return;
    }

    var serialisedJSON = JSON.stringify(jsonObject);

    var localStorage = window.localStorage;

    localStorage.setItem(this._storagePath, serialisedJSON);
}

/**
 * Deletes the current save from the LocalStorage
 * @instance
 */
PersistentStorage.prototype.deleteSave = function () {

    var localStorage = window.localStorage;
    localStorage.removeItem(this._storagePath);

    this._watchedObject = null;
}

/**
 * Retrieves the current object from LocalStorage
 * @instance
 * @returns {Object}
 */
PersistentStorage.prototype.getFromLocalStorage = function () {

    var localStorage = window.localStorage;
    var serializedSave = localStorage.getItem(this._storagePath);
    
    return JSON.parse(serializedSave);
}

/**
 * Watches over a selected object and saves it every few seconds. The number of seconds is equal to delayBetweenSaves
 * @instance
 * @param {Object} savedObject 
 */
PersistentStorage.prototype.setWatchedObject = function (savedObject) {

    var self = this;

    this._watchedObject = savedObject;

    var watchingInterval = setInterval(function () {

        self.lastSavedOn(self.lastSavedOn());

        if (self.secondsSinceLastSave() > self.delayBetweenSaves()) {

            self.saveToLocalStorage(self._watchedObject);
        }

        if (this._watchedObject === null) {

            clearInterval(watchingInterval);
        }

    }, 1000);
}

/**
 * Clears the currently watched object and stops it from being saved every few seconds
 * @instance
 */
PersistentStorage.prototype.clearWatchedObject = function () {

    this._watchedObject = null;
}