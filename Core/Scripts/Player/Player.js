/**
 * An object representing the current player
 * @class
 */
function Player() {

    /**
     * The bank containing the player's money
     * @type {KnockoutObservable<BankViewModel>}
     * @instance
     */
    this.bank = ko.observable(null);
}

/**
 * Creates a new player object
 * @returns {Player}
 */
Player.create = function() {

    var player = new Player();

    player.bank(Bank.create());

    return player;
}

/**
 * Restores a player object from JSON
 * @param {Object} savedPlayer - A JSON object referencing a player
 * @returns {Player}
 */
Player.restore = function(savedPlayer) {

    var player = new Player();

    player.bank(Bank.restore(savedPlayer.bank));

    return player;
}

Player.prototype.toJSON = function() {

    return {

        bank: this.bank()
    };
}