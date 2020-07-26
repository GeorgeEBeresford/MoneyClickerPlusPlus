 /**
  * An object that allows the viewing, purchasing and selling of stocks for different companies
  * @class
  */
function StockExchange() {

    var self = this;

    /**
     * A collection of companies referenced by the stock market
     * @type {KnockoutObservableArray<Company>}
     * @instance
     */
    this.companies = ko.observableArray(null);

    /**
     * The company that is currently selected by the player
     * @type {KnockoutObservable<Company>}
     * @instance
     */
    this.selectedCompany = ko.observable(null);

    /**
     * The bank holding the player's money
     * @type {Bank}
     * @instance
     */
    this._bank = null;

    /**
     * The number of units of stock that the player wishes to buy
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.stockAmountToBuy = ko.observable(1);

    /**
     * The calculated cost of buying the specified number of stock units
     * @type {KnockoutComputed<Number>}
     * @instance
     */
    this.priceToBuyStock = ko.computed(function() {

        var companyBuffer = self.selectedCompany();

        if (companyBuffer === null) {

            return 0;
        }

        var price = self.stockAmountToBuy() * companyBuffer.stockValue();

        return MathsLibrary.round(price, 2);
    })
}

/**
 * Finds the company with the given name and selects it for the player
 * @param {String} companyName - The name of the company which should be selected
 * @instance
 */
StockExchange.prototype.selectCompanyByName = function(companyName) {

    var company = null;
    var companiesBuffer = this.companies();

    for (var companyIndex = 0; companyIndex < companiesBuffer.length && company === null; companyIndex++){

        var currentCompany = companiesBuffer[companyIndex];

        if (currentCompany.companyName() == companyName){

            company = currentCompany;
        }
    }

    if (company !== null) {

        this.selectedCompany(company);
    }
}

/**
 * Attempts to purchase a specified number of stocks. Returns true or false depending on whether the player can afford to
 * @param {Number} amount - The number of stocks to purchase
 */
StockExchange.prototype.tryPurchaseStocks = function(amount){

    var priceBuffer = this.priceToBuyStock();

    if (!this._bank.tryWithdraw(priceBuffer)) {

        console.log("Could not afford to buy " + amount + " for $" + priceBuffer.toFixed(2))
        return false;
    }

    console.log("Bought " + amount + " stocks");
}

/**
 * Converts the ViewModel to JSON
 * @instance
 * @returns {Object}
 */
StockExchange.prototype.toJSON = function() {

    return {

        companies: this.companies(),
        ticker: this.ticker,
        selectedCompany: this.selectedCompany() !== null ? this.selectedCompany().companyName() : null
    };
}

/**
 * Creates a new stock exchange
 * @param {Bank} bank - A reference to the player's bank, to ensure they have enough funds for any purchases
 * @returns {StockExchange}
 */
StockExchange.create = function(bank) {

    var stockExchange = new StockExchange();
    var companies = [];

    for (var companyIndex = 0; companyIndex < gameConfig.defaultCompanies.length; companyIndex++) {

        var defaultCompany = gameConfig.defaultCompanies[companyIndex];
        var generatedCompany = Company.createConfigured(defaultCompany);

        companies.push(generatedCompany);
    }
    
    stockExchange.companies(companies);
    stockExchange._bank = bank;

    return stockExchange;
}

/**
 * Restores a ViewModel from JSON
 * @param {Object} savedStockExchange - A JSON object that references a StockExchange
 * @param {Bank} bank - A reference to the player's bank, to ensure they have enough funds for any purchases
 * @returns {StockExchange}
 */
StockExchange.restore = function(savedStockExchange, bank) {

    var stockExchange = new StockExchange();
    var companies = [];

    for (var companyIndex = 0; companyIndex < savedStockExchange.companies.length; companyIndex++) {

        var savedCompany = savedStockExchange.companies[companyIndex];
        var restoredCompany = Company.restore(savedCompany);

        companies.push(restoredCompany);
    }

    stockExchange.companies(companies);
    stockExchange.selectCompanyByName(savedStockExchange.selectedCompany);
    stockExchange._bank = bank;

    return stockExchange;
}