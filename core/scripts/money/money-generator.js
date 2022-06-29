import * as ko from "../common/knockout";
import MathsLibrary from "../common/maths-library";
/**
 * An object that can be used to generate money for the player from thin air
 */
export default class MoneyGenerator {
    /**
     * Creates a new MoneyGenerator
     */
    constructor() {
        this.baseCashPerClick = ko.observable(1);
        this.boostExpires = ko.observable(new Date(0));
        this.boostedSecondsRemaining = ko.computed(() => {
            if (this.boostExpires() === null) {
                return 0;
            }
            var boostedMillisecondsRemaining = (this.boostExpires().getTime() - new Date().getTime());
            if (boostedMillisecondsRemaining <= 0) {
                return 0;
            }
            var boostedSecondsRemaining = Math.ceil(boostedMillisecondsRemaining / 1000);
            return boostedSecondsRemaining;
        });
        this.upgradeCost = ko.computed(() => {
            var upgradeCost = 20 * Math.pow(this.baseCashPerClick(), 2);
            var flooredCost = MathsLibrary.floor(upgradeCost, 2);
            return flooredCost;
        });
        this.cashPerClick = ko.computed(() => {
            return this.boostExpires() > new Date() ? this.baseCashPerClick() * 2 : this.baseCashPerClick();
        });
    }
    /**
     * Restores a MoneyGenerator from JSON
     * @param savedMoneyGenerator - A JSON object representing the money generator
     * @param bank - A reference to the bank which any money will be deposited into
     * @returns the restored MoneyGenerator
     */
    static restore(savedMoneyGenerator) {
        var moneyGenerator = new MoneyGenerator();
        if (savedMoneyGenerator !== null) {
            moneyGenerator.baseCashPerClick(savedMoneyGenerator.baseCashPerClick);
            moneyGenerator.boostExpires(new Date(savedMoneyGenerator.boostExpires));
        }
        return moneyGenerator;
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        return {
            baseCashPerClick: this.baseCashPerClick(),
            boostExpires: this.boostExpires().toISOString()
        };
    }
    /**
     * Calculates the cost of boosting the money generator for the specified number of seconds
     * @param seconds - The number of seconds to boost the generator for
     * @returns the cost of boosting the money generator for the specified number of seconds
     */
    getBoostCost(seconds) {
        var upgradeCost = seconds * Math.pow(this.baseCashPerClick(), 1.85);
        var flooredCost = MathsLibrary.floor(upgradeCost, 2);
        return flooredCost;
    }
    /**
     * Doubles the output of the boost generator for a limited number of seconds
     * @param seconds - The number of seconds to boost the generator for
     * @param bank - The bank which we'll withdraw the funds for the boost from
     * @returns whether the player could afford to boost the generator
     */
    boostGenerator(seconds, bank) {
        var isWithdrawalSuccess = bank.tryWithdraw(this.getBoostCost(seconds));
        if (!isWithdrawalSuccess) {
            return false;
        }
        var now = new Date();
        var newExpiration = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds() + seconds);
        this.boostExpires(newExpiration);
        return true;
    }
    /**
     * Generates money out of thin air for the player
     * @param bank - The bank which we'll deposit the generated funds into
     */
    generateCash(bank) {
        bank.deposit(this.cashPerClick());
    }
    /**
     * Upgrades the money generator to give 1 more currency per click
     * @param bank - The bank which we'll withdraw the funds for the boost from
     * @returns whether the player could afford to upgrade the generator
     */
    upgradeGenerator(bank) {
        const upgradeCost = this.upgradeCost();
        var isWithdrawalSuccess = bank.tryWithdraw(upgradeCost);
        if (!isWithdrawalSuccess) {
            return false;
        }
        this.baseCashPerClick(this.baseCashPerClick() + 1);
        return true;
    }
    /**
     * Keeps an eye on the current time and refreshes any time-based displays
     */
    watchCurrentTime() {
        setInterval(() => {
            // Refresh the expiration time every second
            this.boostExpires(this.boostExpires());
        }, 1000);
    }
}
//# sourceMappingURL=money-generator.js.map