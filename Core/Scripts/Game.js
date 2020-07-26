window.addEventListener("load", function () {

    var game = Game.restore() || Game.create();
    game.initialise();

    ko.applyBindings(game);
})

/**
 * The main controller for the game
 * @class
 */
function Game() {

    /**
     * The bank containing the player's money
     * @type {KnockoutObservable<BankViewModel>}
     * @instance
     */
    this.bank = ko.observable(null);

    /**
     * Generates money out of thin air for the player
     * @type {KnockoutObservable<MoneyGeneratorViewModel>}
     * @instance
     */
    this.moneyGenerator = ko.observable(null);

    /**
     * Saves the game and allows it to be reloaded
     * @type {KnockoutObservable<PersistentStorageViewModel>}
     * @instance
     */
    this.persistentStorage = ko.observable(null);

    /**
     * The currently displayed panel
     * @type {KnockoutObservable<String>}
     * @instance
     */
    this.currentPanel = ko.observable(null);

    /**
     * A ticker that keeps track of changes to each company
     * @type {KnockoutObservable<Ticker>}
     * @instance
     */
    this.ticker = ko.observable(null);
}

/**
 * The unique string for referencing the saved game
 * @type {String}
 */
Game.persistentStoragePath = "moneyclicker++/savegame";

/**
 * Creates a new view model
 * @returns {Game}
 */
Game.create = function () {

    var game = new Game();

    game.bank(Bank.create());
    game.moneyGenerator(MoneyGenerator.create(game.bank()));
    game.persistentStorage(PersistentStorage.create(Game.persistentStoragePath));
    game.ticker(Ticker.create(game.bank()));
    game.currentPanel("MoneyGenerator");

    return game;
}

/**
 * Restores a view model from a previous saved game
 * @returns {Game}
 */
Game.restore = function () {

    var persistentStorage = PersistentStorage.create(Game.persistentStoragePath);

    var existingSave = persistentStorage.getFromLocalStorage();

    if (existingSave === null) {

        return null;
    }

    var restoredBank = Bank.restore(existingSave.bank);
    var restoredMoneyGenerator = MoneyGenerator.restore(existingSave.moneyGenerator, restoredBank);
    var restoredPersistentStorage = PersistentStorage.restore(existingSave.persistentStorage, Game.persistentStoragePath);
    var restoredTicker = Ticker.restore(existingSave.ticker, restoredBank);

    var game = new Game();
    game.bank(restoredBank);
    game.moneyGenerator(restoredMoneyGenerator);
    game.persistentStorage(restoredPersistentStorage);
    game.ticker(restoredTicker);
    game.currentPanel(existingSave.currentPanel);

    return game;
}

/**
 * Initialises any objects that make up the current view model
 * @instance
 */
Game.prototype.initialise = function () {

    this.persistentStorage().setWatchedObject(this);
    this.moneyGenerator().watchCurrentTime();
    this.ticker().startTicking();
}

/**
 * Changes the currently visible panel to the specified string
 * @param {String} panelName - The name of the panel which should be visible
 * @instance
 */
Game.prototype.changePanel = function (panelName) {

    this.currentPanel(panelName);
}

/**
 * Converts the current object to JSON
 * @returns {Object}
 */
Game.prototype.toJSON = function () {

    return {

        currentPanel: this.currentPanel(),
        bank: this.bank(),
        moneyGenerator: this.moneyGenerator(),
        persistentStorage: this.persistentStorage(),
        ticker: this.ticker()
    };
}