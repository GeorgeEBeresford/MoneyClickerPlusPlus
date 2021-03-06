window.addEventListener("load", function () {

    var game = Game.restore() || Game.create();

    ko.applyBindings(game);
})

/**
 * The main controller for the game
 * @class
 */
function Game() {

    /**
     * A reference to the current player
     * @type {KnockoutObservable<Player>}
     * @instance
     */
    this.player = ko.observable(null);

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
 * The first panel that the player will see upon entering the game
 */
Game.defaultPanel = "MoneyGenerator";

/**
 * Creates a new view model
 * @returns {Game}
 */
Game.create = function () {

    var game = new Game();

    game.player(Player.create());
    game.moneyGenerator(MoneyGenerator.create(game.player()));
    game.persistentStorage(PersistentStorage.create(Game.persistentStoragePath));
    game.ticker(Ticker.create(game.player()));
    game.currentPanel(Game.defaultPanel);
    game._initialise();

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

    var restoredPlayer = Player.restore(existingSave.player);
    var restoredMoneyGenerator = MoneyGenerator.restore(existingSave.moneyGenerator, restoredPlayer);
    var restoredPersistentStorage = PersistentStorage.restore(existingSave.persistentStorage, Game.persistentStoragePath);
    var restoredTicker = Ticker.restore(existingSave.ticker, restoredPlayer);

    var game = new Game();
    game.player(restoredPlayer);
    game.moneyGenerator(restoredMoneyGenerator);
    game.persistentStorage(restoredPersistentStorage);
    game.ticker(restoredTicker);
    game.currentPanel(Game.defaultPanel);
    game._initialise();

    return game;
}

/**
 * Initialises any objects that make up the current view model
 * @instance
 */
Game.prototype._initialise = function () {

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

    // Reset their company selection so the player is presented with a fresh panel
    this.ticker().stockExchange().selectedCompany(null);
}

/**
 * Converts the current object to JSON
 * @returns {Object}
 */
Game.prototype.toJSON = function () {

    return {

        player: this.player(),
        moneyGenerator: this.moneyGenerator(),
        persistentStorage: this.persistentStorage(),
        ticker: this.ticker()
    };
}