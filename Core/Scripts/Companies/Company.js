"use strict";
/**
 * A company that provides a service or goods to customers
 */
class Company {
    /**
     * Creates a new Company
     * @param isSystemOwned - Whether the company is owned by the application
     */
    constructor(isSystemOwned) {
        this.isSystemOwned = isSystemOwned;
        this.companyName = ko.observable("");
        this.stockYield = ko.observable(0);
        this.stockValue = ko.observable(0);
        this.valueHistory = ko.observableArray([]);
        this.lastUpdated = ko.observable(new Date(0));
        this.stockValueChange = ko.computed(() => {
            if (this.valueHistory().length < 2) {
                return 0;
            }
            var oldestValue = this.valueHistory()[0];
            var difference = this.stockValue() - oldestValue;
            return difference;
        });
        this.historicValuesAscendingOrder = ko.computed(() => {
            var historyBuffer = this.valueHistory().slice(0);
            var uniqueValues = [];
            historyBuffer.forEach(historicValue => {
                var isUnique = uniqueValues.indexOf(historicValue) === -1;
                if (isUnique) {
                    uniqueValues.push(historicValue);
                }
            });
            var orderedValues = uniqueValues.sort(function (previousValue, currentValue) {
                return previousValue - currentValue;
            });
            return orderedValues;
        });
        this.valueHistoryTrend = ko.computed(() => {
            var trendPoints = [];
            this.valueHistory().forEach((historicValue, valueIndex) => {
                var indexOfValue = this.historicValuesAscendingOrder().indexOf(historicValue);
                var coordinateX = valueIndex * 10;
                var coordinateY = 100 - (indexOfValue * 10);
                trendPoints.push(coordinateX + "," + coordinateY);
            });
            var trend = trendPoints.join(" ");
            return trend;
        });
        this.dividendsDescriptor = ko.computed(() => {
            switch (this.stockYield()) {
                case (0): return "no";
                case (1): return "very low";
                case (2): return "low";
                case (3): return "medium";
                case (4): return "high";
                case (5): return "very high";
                default:
                    console.error(`No descriptor for stockYield ${this.stockYield()}`);
                    throw `No descriptor for stockYield ${this.stockYield()}`;
            }
        });
        this.isSystemOwned = true;
    }
    /**
     * Restores a company from the application configuration
     * @param systemCompany - JSON object that references a Company owned by the application
     * @returns the restored Company object
     */
    static restoreSystemCompany(systemCompany) {
        const company = new Company(true);
        company.stockYield(systemCompany.stockYield);
        company.stockValue(systemCompany.stockValue);
        company.lastUpdated(new Date(0));
        company.companyName(systemCompany.companyName);
        // Add some initial changes to the company so we have some initial graph data to work with
        for (let index = 0; index < Company.maxHistoryLength; index++) {
            company.makeRandomChange();
        }
        return company;
    }
    /**
     * Restores a Company object that has been saved
     * @param savedCompany - JSON object that references a Company
     * @returns the restored Company object
     */
    static restore(savedCompany) {
        const company = new Company(false);
        company.stockYield(savedCompany.stockYield);
        company.stockValue(savedCompany.stockValue);
        company.lastUpdated(new Date(savedCompany.lastUpdated));
        company.companyName(savedCompany.companyName);
        return company;
    }
    /**
     * Retrieves the number of stocks that a player owns for the current company
     * @param player - The player we want to check the stock count for
     * @returns the number of stocks that a player owns for the current company
     */
    getPlayerStockCount(player) {
        var purchasedStock = player.purchasedStock();
        var investmentsInThisCompany = purchasedStock[this.companyName()];
        const amount = investmentsInThisCompany !== undefined ? investmentsInThisCompany.amount : 0;
        return amount;
    }
    /**
     * Retrieves the profits the player has made since they purchased the stocks. The value of the stock when it was last purchased will be considered when checking the "original" value.
     * @param player The player we want to check the stock profits for
     * @returns the profits the player has made since they purchased the stocks
     */
    getPlayerStockProfit(player) {
        var purchasedStock = player.purchasedStock();
        var investmentsInThisCompany = purchasedStock[this.companyName()];
        if (typeof (investmentsInThisCompany) === "undefined" || investmentsInThisCompany.amount === 0) {
            return 0;
        }
        var initialValue = investmentsInThisCompany.valueWhenPurchased;
        var currentValue = this.stockValue();
        var valueDifference = currentValue - initialValue;
        var profit = (valueDifference / currentValue) * 100;
        return profit;
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        return {
            companyName: this.companyName(),
            stockYield: this.stockYield(),
            stockValue: this.stockValue(),
            lastUpdated: this.lastUpdated().toISOString(),
            valueHistory: this.valueHistory()
        };
    }
    /**
     * Makes random changes to the company
     */
    makeRandomChange() {
        var noChangeRoll = MathsLibrary.getRandomNumber(0, 100);
        if (noChangeRoll < 20) {
            // Archive the current value of the company
            this.valueHistory.push(this.stockValue());
        }
        else {
            var modificationIsLargeRoll = MathsLibrary.getRandomNumber(0, 100);
            var modification = modificationIsLargeRoll < 0.0001 ? MathsLibrary.getRandomNumber(8, 10) : MathsLibrary.getRandomNumber(0.01, 0.75);
            var goodOrBadRoll = MathsLibrary.getRandomNumber(0, 100);
            modification = goodOrBadRoll < 50 ? 0 - modification : modification;
            this.lastUpdated(new Date());
            var roundedValue = MathsLibrary.round(this.stockValue() + modification, 2);
            // The game will be waaay too easy if we let the stock reach too low a value. For balance's sake, stop it from sinking too low.
            if (roundedValue < this.stockYield() * 10.04) {
                roundedValue = this.stockYield() * 10.04;
            }
            // Modify the value of the company
            this.stockValue(roundedValue);
            // Archive the current value of the company
            this.valueHistory.push(this.stockValue());
        }
        // The value history has a maximum number of records. Make sure we don't exceed it.
        if (this.valueHistory().length > Company.maxHistoryLength) {
            this.valueHistory.shift();
        }
    }
}
/**
 * The maximum number of history records to keep for a company
 */
Company.maxHistoryLength = 11;
//# sourceMappingURL=company.js.map