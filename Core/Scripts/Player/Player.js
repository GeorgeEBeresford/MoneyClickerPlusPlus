/**
 * An object representing the current player
 * @class
 */
function Player() {

    var self = this;

    /**
     * The bank containing the player's money
     * @type {KnockoutObservable<BankViewModel>}
     * @instance
     */
    this.bank = ko.observable(null);

    /**
     * An object which will keep track of how many stocks are owned for each company
     * @type {KnockoutObservable<{}>}
     */
    this.purchasedStock = ko.observable(null);
    
    /**
     * Calculates the player's income per minute based off each company's dividends
     * @type {KnockoutComputed<Number>}
     */
    this.getStockIncomePerMinute = ko.computed(function() {
    
        var purchasedStock = self.purchasedStock();

        if (purchasedStock === null) {

            return 0;
        }

        var dividends = 0;
        var companyNames = Object.keys(purchasedStock);
    
        for (var stockIndex = 0; stockIndex < companyNames.length; stockIndex++) {
    
            var companyName = companyNames[stockIndex];
            var stock = purchasedStock[companyName];
    
            dividends += stock.amount * stock.dividends;
        }
    
        return dividends;
    });

    /**
     * Keeps track of the player's current total income per minute
     * @type {KnockoutComputed<Number>}
     */
    this.incomePerMinute = ko.computed(function() {

        var incomePerMinute = self.getStockIncomePerMinute();
        var flooredIncome = MathsLibrary.floor(incomePerMinute, 2);

        return flooredIncome;
    });
}

/**
 * Creates a new player object
 * @returns {Player}
 */
Player.create = function() {

    var player = new Player();

    player.bank(Bank.create());
    player.purchasedStock({});

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
    player.purchasedStock(savedPlayer.purchasedStock);

    return player;
}

Player.prototype.toJSON = function() {

    return {

        bank: this.bank(),
        purchasedStock: this.purchasedStock()
    };
}