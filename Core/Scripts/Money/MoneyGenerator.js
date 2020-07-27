/**
 * An object that can be used to generate money for the player from thin air
 * @class
 */
function MoneyGenerator() {

    var self = this;

    /**
     * A reference to the current player
     * @type {KnockoutObservable<Player>}
     * @instance
     */
    this.player = ko.observable(null);

    /**
     * The amount of money that the player will receive without boosts
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.baseCashPerClick = ko.observable(1);

    /**
     * The time and date of when the money generator boost runs out
     * @type {KnockoutObservable<Date>}
     * @instance
     */
    this.boostExpires = ko.observable(null);

    /**
     * Calculates the number of seconds between the current date and time, and the time and date that the boost expires
     * @type {KnockoutComputed<Number>}
     * @instance
     */
    this.boostedSecondsRemaining = ko.computed(function () {

        if (self.boostExpires() === null) {

            return 0;
        }

        var boostedMillisecondsRemaining = (self.boostExpires().getTime() - new Date().getTime());

        if (boostedMillisecondsRemaining <= 0) {

            return 0;
        }

        var boostedSecondsRemaining = Math.ceil(boostedMillisecondsRemaining / 1000);

        return boostedSecondsRemaining;
    })

    /**
     * Calculates the cost of upgrading the money generator
     * @type {KnockoutComputed<Number>}
     * @instance
     */
    this.upgradeCost = ko.computed(function () {

        var upgradeCost = 20 * Math.pow(self.baseCashPerClick(), 2);
        var flooredCost = MathsLibrary.floor(upgradeCost, 2);

        return flooredCost;
    })

    /**
     * Calculates how much money is generated for each click
     * @type {KnockoutComputed<Number>}
     * @instance
     */
    this.cashPerClick = ko.computed(function () {

        return self.boostExpires() > new Date() ? self.baseCashPerClick() * 2 : self.baseCashPerClick();
    })
}

/**
 * Creates a new MoneyGenerator
 * @param {Player} player - A reference to the current player
 */
MoneyGenerator.create = function (player) {

    var moneyGenerator = new MoneyGenerator();

    moneyGenerator.player(player);
    moneyGenerator.baseCashPerClick(1);
    moneyGenerator.boostExpires(new Date(0));

    moneyGenerator.generateIncome();

    return moneyGenerator;
}

/**
 * Restores a money generator from JSON
 * @param {Object} savedMoneyGenerator - A JSON object representing the money generator
 * @param {Player} player - A reference to the current player
 * @returns {MoneyGenerator}
 */
MoneyGenerator.restore = function (savedMoneyGenerator, player) {

    if (typeof (savedMoneyGenerator) === "undefined" || savedMoneyGenerator === null) {

        return null;
    }

    var moneyGenerator = new MoneyGenerator();

    moneyGenerator.player(player);
    moneyGenerator.baseCashPerClick(savedMoneyGenerator.baseCashPerClick);
    moneyGenerator.boostExpires(new Date(savedMoneyGenerator.boostExpires));
    
    moneyGenerator.generateIncome();

    return moneyGenerator;
}

/**
 * Generates income for the player every minute
 */
MoneyGenerator.prototype.generateIncome = function() {

    var self = this;

    setInterval(function() {

        var moneyPerMinute = self.player().incomePerMinute();

        self.player().bank().deposit(moneyPerMinute);

    }, 60000);
}

/**
 * Converts the current ViewModel to JSON
 * @instance
 * @returns {Object}
 */
MoneyGenerator.prototype.toJSON = function () {

    return {

        baseCashPerClick: this.baseCashPerClick(),
        boostExpires: this.boostExpires()
    };
}

/**
 * Returns the cost of boosting the money generator for the specified number of seconds
 * @param {Number} seconds - The number of seconds to boost the generator for
 * @instance
 * @returns {Number}
 */
MoneyGenerator.prototype.getBoostCost = function (seconds) {

    var upgradeCost = seconds * Math.pow(this.baseCashPerClick(), 1.85);
    var flooredCost = MathsLibrary.floor(upgradeCost, 2);

    return flooredCost;
}

/**
 * Doubles the output of the boost generator for a limited number of seconds
 * @param {Number} seconds - The number of seconds to boost the generator for
 * @instance
 */
MoneyGenerator.prototype.boostGenerator = function (seconds) {

    var isWithdrawalSuccess = this.player().bank().tryWithdraw(this.getBoostCost(seconds));

    if (!isWithdrawalSuccess) {

        return;
    }

    var now = new Date();

    var newExpiration = new Date(
        now.getFullYear(), now.getMonth(), now.getDate(),
        now.getHours(), now.getMinutes(), now.getSeconds() + seconds
    );

    this.boostExpires(newExpiration);
}

/**
 * Generates money out of thin air for the player
 * @instance
 */
MoneyGenerator.prototype.generateCash = function () {

    this.player().bank().deposit(this.cashPerClick())
}

/**
 * Upgrades the money generator to give 1 more currency per click
 * @instance
 */
MoneyGenerator.prototype.upgradeGenerator = function () {

    var isWithdrawalSuccess = this.player().bank().tryWithdraw(this.upgradeCost());

    if (!isWithdrawalSuccess) {

        return;
    }

    this.baseCashPerClick(this.baseCashPerClick() + 1);
}

/**
 * Keeps an eye on the current time and refreshes any time-based displays
 * @instance
 */
MoneyGenerator.prototype.watchCurrentTime = function () {

    var self = this;

    setInterval(function () {

        // Refresh the expiration time every second
        self.boostExpires(self.boostExpires());

    }, 1000);
}