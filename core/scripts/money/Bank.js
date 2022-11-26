import * as ko from "../common/knockout";
import MathsLibrary from "../common/maths-library";
/**
 * An object representing a bank to hold the currency of the player
 */
export default class Bank {
    /**
     * Creates a new Bank
     */
    constructor() {
        this.balance = ko.observable(0);
    }
    /**
     * Restores a Bank from JSON
     * @param savedBank - A JSON object representing a Bank
     * @param savedBank the restored Bank
     */
    static restore(savedBank) {
        var bank = new Bank();
        if (savedBank !== null) {
            bank.balance(savedBank.balance);
        }
        return bank;
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        return {
            // Balance was being saved with absurd number of decimal places
            balance: MathsLibrary.floor(this.balance(), 2)
        };
    }
    /**
     * Deposits a specified amount of currency into the bank
     * @param amount - The amount of currency to deposit
     */
    deposit(amount) {
        /**
         * You can't have 0.001 dollars. It's just not possible.
         */
        amount = MathsLibrary.floor(amount, 2);
        this.balance(this.balance() + MathsLibrary.round(amount, 2));
    }
    /**
     * Attempts to withdraw an amount of money out for the player. No money is withdrawn if the player does not have enough funds to cover the cost
     * @param amount - The amount which needs to be withdrawn
     * @returns whether the player has enough funds to cover the cost
     */
    tryWithdraw(amount) {
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
}
//# sourceMappingURL=bank.js.map