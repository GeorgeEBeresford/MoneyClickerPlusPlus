import * as ko from "../common/knockout";
import Company from "./company";
import gameConfig from "../common/game-config";
import MathsLibrary from "../common/maths-library";
/**
 * An object that allows the viewing, purchasing and selling of stocks for different companies
 */
export default class StockExchange {
    /**
     * Creates a new StockExchange
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     */
    constructor() {
        this.purchasedStock = ko.observable({});
        this.stockIncomePerMinute = ko.computed(() => {
            const purchasedStock = this.purchasedStock();
            const companyNames = Object.keys(purchasedStock);
            let incomePerMinute = 0;
            companyNames.forEach(companyName => {
                const minimumOwnedStockForPayout = this.getMinimumOwnedStockForPayout(companyName);
                if (minimumOwnedStockForPayout !== 0) {
                    const companyStocks = purchasedStock[companyName];
                    incomePerMinute += Math.floor(companyStocks.amount / minimumOwnedStockForPayout);
                }
            });
            return incomePerMinute;
        });
        const companies = [];
        gameConfig.defaultCompanies.forEach(defaultCompany => {
            const generatedCompany = Company.restoreSystemCompany(defaultCompany);
            companies.push(generatedCompany);
        });
        this.companies = ko.observableArray(companies);
        this.playerInvestedCompanies = ko.computed(() => {
            const companiesBuffer = this.companies();
            const playerInvestmentsBuffer = Object.keys(this.purchasedStock());
            const filteredCompanies = companiesBuffer.filter((potentialPlayerInvestment) => {
                const companyName = potentialPlayerInvestment.companyName();
                const isInvestment = playerInvestmentsBuffer.indexOf(companyName) !== -1;
                return isInvestment && this.purchasedStock()[companyName].amount !== 0;
            });
            return filteredCompanies;
        });
        this.selectedCompany = ko.observable(null);
        this.stockAmountToBuy = ko.observable("1");
        this.priceToBuyStock = ko.computed(() => {
            const selectedCompany = this.selectedCompany();
            if (selectedCompany === null) {
                return 0;
            }
            const stockAmountToBuy = this.stockAmountToBuy();
            const pricePerStock = selectedCompany.pricePerStock();
            if (isNaN(+stockAmountToBuy)) {
                return 0;
            }
            const price = +stockAmountToBuy * pricePerStock;
            return MathsLibrary.round(price, 2);
        });
        this.purchasedStockCount = ko.computed(() => {
            const selectedCompany = this.selectedCompany();
            const purchasedStock = this.purchasedStock();
            if (selectedCompany === null) {
                return 0;
            }
            const selectedCompanyName = selectedCompany.companyName();
            const purchasedCompanyStock = purchasedStock[selectedCompanyName];
            if (purchasedCompanyStock === undefined) {
                return 0;
            }
            const amountOwned = purchasedCompanyStock.amount;
            return amountOwned;
        });
        this.playerStockProfit = ko.computed(() => {
            const selectedCompany = this.selectedCompany();
            if (selectedCompany === null) {
                return 0;
            }
            const currentPricePerStock = selectedCompany.pricePerStock();
            const companyName = selectedCompany.companyName();
            const purchasedStock = this.purchasedStock();
            const companyStocks = purchasedStock[companyName];
            if (companyStocks === undefined) {
                return 0;
            }
            const valueWhenPurchased = companyStocks.valueWhenPurchased;
            const valueDifference = currentPricePerStock - valueWhenPurchased;
            const profit = (valueDifference / currentPricePerStock) * 100;
            return profit;
        });
    }
    /**
     * Restores a StockExchange object that has been saved
     * @param savedStockExchange - A JSON object that references a StockExchange
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     * @returns the restored StockExchange object
     */
    static restore(savedStockExchange) {
        const stockExchange = new StockExchange();
        if (savedStockExchange !== null) {
            savedStockExchange.companies.forEach(playerCompany => {
                const savedCompany = Company.restore(playerCompany);
                stockExchange.companies.push(savedCompany);
            });
            if (savedStockExchange.selectedCompany !== null) {
                stockExchange.selectCompanyByName(savedStockExchange.selectedCompany);
            }
            stockExchange.purchasedStock(savedStockExchange.purchasedStock);
        }
        return stockExchange;
    }
    /**
     * Finds the first company with a matching name and selects it
     * @param companyName - The name of the company we're selecting
     */
    selectCompanyByName(companyName) {
        const matchingCompany = this.companies().find(potentialCompany => {
            return potentialCompany.companyName() === companyName;
        });
        if (matchingCompany !== undefined) {
            this.selectedCompany(matchingCompany);
        }
    }
    /**
     * Attempts to sell a specified number of stocks. If the player doesn't have enough stocks to sell, no stocks will be sold
     * @param bank - The bank containing the player's funds
     * @returns whether the player has enough stocks to sell
     */
    trySellStocks(bank) {
        const playerStockCollection = this.purchasedStock();
        const company = this.selectedCompany();
        if (company === null) {
            return false;
        }
        if (isNaN(+this.stockAmountToBuy())) {
            return false;
        }
        const companyName = company.companyName();
        const ownedStock = playerStockCollection[companyName];
        if (ownedStock.amount < +this.stockAmountToBuy()) {
            return false;
        }
        const totalStockvalue = this.priceToBuyStock();
        ownedStock.amount -= +this.stockAmountToBuy();
        // Since we no longer own any of these stocks, we can safely discard this
        if (ownedStock.amount === 0) {
            delete playerStockCollection[companyName];
        }
        bank.deposit(totalStockvalue);
        // Let the knockout binding know there has been a change
        this.purchasedStock(playerStockCollection);
        return true;
    }
    /**
     * Attempts to purchase a specified number of stocks. If the player cannot afford to purchase all of the stocks, no stocks will be purchased
     * @param bank - The bank containing the player's funds
     * @returns whether the player has enough funds to cover the costs of the stock
     */
    tryPurchaseStocks(bank) {
        const totalPrice = this.priceToBuyStock();
        if (!bank.tryWithdraw(totalPrice)) {
            return false;
        }
        const stockAmountToBuy = this.stockAmountToBuy();
        if (isNaN(+stockAmountToBuy)) {
            return false;
        }
        const playerStockCollection = this.purchasedStock();
        const company = this.selectedCompany();
        if (company === null) {
            return false;
        }
        const companyName = company.companyName();
        let ownedStock = playerStockCollection[companyName];
        if (ownedStock === undefined) {
            const audits = company.audits();
            const latestAudit = audits[0];
            ownedStock = playerStockCollection[companyName] = {
                amount: 0,
                valueWhenPurchased: latestAudit.pricePerStock
            };
        }
        ownedStock.amount += +stockAmountToBuy;
        // Let the knockout binding know there has been a change
        this.purchasedStock(playerStockCollection);
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
            stockToBuy: !isNaN(+this.stockAmountToBuy()) ? +this.stockAmountToBuy() : 0,
            purchasedStock: this.purchasedStock()
        };
    }
    /**
     * Gets the minimum amount of stock the player needs to own in order to receive $1 per minute
     * @param companyName the name of the company
     * @returns
     */
    getMinimumOwnedStockForPayout(companyName) {
        const companies = this.companies();
        const company = companies.find(potentialCompany => potentialCompany.companyName() === companyName);
        if (company === undefined) {
            return 0;
        }
        const companyValue = company.currentValue();
        const stockType = company.stockType();
        // No dividends
        if (stockType === 0) {
            return 0;
        }
        switch (stockType) {
            default:
                console.error(`Stock type ${stockType} not configured. Can't check stocks per money per minute`);
            // Low dividends. They need to purchase 1 stock for every $8,000,000 the company is worth to receive $1
            case 1:
                return companyValue / 8000000;
            // Medium dividends. They need to purchase 1 stock for every $18,500,000 the company is worth in order to receive $1
            case 2:
                return companyValue / 18500000;
            // High dividends. They need to purchase 1 stock for every $200,000,000 the company is worth to receive $1
            case 3:
                return companyValue / 200000000;
            // Very high dividends. They need to purchase 1 stock for every $790,000,000 the company is worth to receive $1
            case 4:
                return companyValue / 790000000;
        }
    }
}
//# sourceMappingURL=stock-exchange.js.map