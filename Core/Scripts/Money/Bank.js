/**
 * An object representing a bank to hold the currency of the player
 * @class
 */
function Bank() {

    var self = this;

    /**
     * The current balance of the player
     * @instance
     * @type {KnockoutObservable<Number>}
     */
    this.balance = ko.observable(0);

    /**
     * The current balance of the player formatted a way that is nice to look at
     * @instance
     * @type {KnockoutComputed<String>}
     */
    this.balancePreview = ko.computed(
        function () {

            var flooredMoney = Math.floor(self.balance() * 100) / 100;
            var formattedMoney = "$" + flooredMoney.toFixed(2);

            return formattedMoney;
        }
    )
}

/**
 * Creates a new ViewModel
 * @returns {BankViewModel}
 */
Bank.create = function() {

    var bankViewModel = new Bank();
    
    bankViewModel.balance(0);

    return bankViewModel;
}

/**
 * Restores a BankViewModel from JSON
 * @param {Object} savedBankViewModel - A JSON object representing a BankViewModel
 * @returns {BankViewModel}
 */
Bank.restore = function (savedBankViewModel) {

    if (savedBankViewModel === null) {

        return null;
    }

    var bank = new Bank();

    bank.balance(savedBankViewModel.balance);

    return bank;
}

/**
 * Converts the current ViewModel to JSON
 * @returns {Object}
 */
Bank.prototype.toJSON = function() {

    return {

        // Balance was being saved with absurd number of decimal places
        balance: MathsLibrary.floor(this.balance(), 2)
    };
}

/**
 * Deposits a specified amount of currency into the bank
 * @param {Number} amount - The amount of currency to deposit
 */
Bank.prototype.deposit = function (amount) {

    /**
     * You can't have 0.001 dollars. It's just not possible.
     */
    amount = MathsLibrary.floor(amount, 2);
    
    this.balance(this.balance() + MathsLibrary.round(amount, 2));
}

/**
 * Attempts to withdraw an amount of money out for the player. Returns true or false depending on whether the player can afford it
 * @param {Number} amount - The amount which needs to be withdrawn
 * @returns {Boolean}
 */
Bank.prototype.tryWithdraw = function (amount) {

    /**
     * You can't have 0.001 dollars. It's just not possible.
     */
    amount = MathsLibrary.floor(amount, 2);

    if (this.balance() < amount) {

        return false;
    }

    this.balance(this.balance() - amount);

    return true;
}