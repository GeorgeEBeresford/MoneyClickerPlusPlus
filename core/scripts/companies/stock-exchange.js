"use strict";
/**
 * An object that allows the viewing, purchasing and selling of stocks for different companies
 * @class
 */
class StockExchange {
    /**
     * Creates a new StockExchange
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     */
    constructor(player) {
        this.player = ko.observable(player);
        const companies = [];
        gameConfig.defaultCompanies.forEach(defaultCompany => {
            var generatedCompany = Company.restoreSystemCompany(defaultCompany);
            companies.push(generatedCompany);
        });
        this.companies = ko.observableArray(companies);
        this.playerInvestedCompanies = ko.computed(() => {
            if (this.player() === null) {
                return [];
            }
            var companiesBuffer = this.companies();
            var playerInvestmentsBuffer = Object.keys(this.player().purchasedStock());
            var filteredCompanies = companiesBuffer.filter((potentialPlayerInvestment) => {
                var companyName = potentialPlayerInvestment.companyName();
                var isInvestment = playerInvestmentsBuffer.indexOf(companyName) !== -1;
                return isInvestment && this.player().purchasedStock()[companyName].amount !== 0;
            });
            return filteredCompanies;
        });
        this.selectedCompany = ko.observable(null);
        this.stockAmountToBuy = ko.observable("1");
        this.priceToBuyStock = ko.computed(() => {
            const company = this.selectedCompany();
            if (company === null) {
                return 0;
            }
            if (isNaN(+this.stockAmountToBuy())) {
                return 0;
            }
            var price = +this.stockAmountToBuy() * company.stockValue();
            return MathsLibrary.round(price, 2);
        });
    }
    /**
     * Restores a StockExchange object that has been saved
     * @param savedStockExchange - A JSON object that references a StockExchange
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     * @returns the restored StockExchange object
     */
    static restore(savedStockExchange, player) {
        var stockExchange = new StockExchange(player);
        if (savedStockExchange !== null) {
            savedStockExchange.companies.forEach(playerCompany => {
                const savedCompany = Company.restore(playerCompany);
                stockExchange.companies.push(savedCompany);
            });
            if (savedStockExchange.selectedCompany !== null) {
                stockExchange.selectCompanyByName(savedStockExchange.selectedCompany);
            }
        }
        return stockExchange;
    }
    /**
     * Finds the first company with a matching name and selects it
     * @param companyName - The name of the company we're selecting
     */
    selectCompanyByName(companyName) {
        var matchingCompany = this.companies().find(potentialCompany => {
            return potentialCompany.companyName() === companyName;
        });
        if (matchingCompany !== undefined) {
            this.selectedCompany(matchingCompany);
        }
    }
    /**
     * Attempts to sell a specified number of stocks. If the player doesn't have enough stocks to sell, no stocks will be sold
     * @returns whether the player has enough stocks to sell
     */
    trySellStocks() {
        var playerStockCollection = this.player().purchasedStock();
        var company = this.selectedCompany();
        if (company === null) {
            return false;
        }
        if (isNaN(+this.stockAmountToBuy())) {
            return false;
        }
        var ownedStock = playerStockCollection[company.companyName()];
        if (ownedStock.amount < +this.stockAmountToBuy()) {
            return false;
        }
        var totalStockvalue = this.priceToBuyStock();
        ownedStock.amount -= +this.stockAmountToBuy();
        // Since we no longer own any of these stocks, we can safely discard this
        if (ownedStock.amount === 0) {
            ownedStock.valueWhenPurchased = 0;
        }
        this.player().bank().deposit(totalStockvalue);
        // Let the knockout binding know there has been a change
        this.player().purchasedStock(this.player().purchasedStock());
        return true;
    }
    /**
     * Attempts to purchase a specified number of stocks. If the player cannot afford to purchase all of the stocks, no stocks will be purchased
     * @returns whether the player has enough funds to cover the costs of the stock
     */
    tryPurchaseStocks() {
        var priceBuffer = this.priceToBuyStock();
        if (!this.player().bank().tryWithdraw(priceBuffer)) {
            return false;
        }
        if (isNaN(+this.stockAmountToBuy())) {
            return false;
        }
        var playerStockCollection = this.player().purchasedStock();
        var company = this.selectedCompany();
        if (company === null) {
            return false;
        }
        var ownedStock = playerStockCollection[company.companyName()];
        if (ownedStock === undefined) {
            ownedStock = playerStockCollection[company.companyName()] = {
                amount: 0,
                dividends: company.stockYield(),
                valueWhenPurchased: company.stockValue()
            };
        }
        ownedStock.amount += +this.stockAmountToBuy();
        // Let the knockout binding know there has been a change
        this.player().purchasedStock(this.player().purchasedStock());
        return true;
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        const company = this.selectedCompany();
        return {
            companies: this.companies().filter(company => !company.isSystemOwned).map(company => company.toJSON()),
            selectedCompany: company !== null ? company.companyName() : null,
            stockToBuy: !isNaN(+this.stockAmountToBuy()) ? +this.stockAmountToBuy() : 0
        };
    }
}
//# sourceMappingURL=stock-exchange.js.map