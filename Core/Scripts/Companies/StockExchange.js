/**
 * An object that allows the viewing, purchasing and selling of stocks for different companies
 * @class
 */
function StockExchange() {

    var self = this;

    /**
     * A reference to the current player
     * @type {KnockoutObservable<Player>}
     * @instance
     */
    this.player = ko.observable(null);

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
    this.priceToBuyStock = ko.computed(function () {

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
StockExchange.prototype.selectCompanyByName = function (companyName) {

    var company = null;
    var companiesBuffer = this.companies();

    for (var companyIndex = 0; companyIndex < companiesBuffer.length && company === null; companyIndex++) {

        var currentCompany = companiesBuffer[companyIndex];

        if (currentCompany.companyName() == companyName) {

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
StockExchange.prototype.tryPurchaseStocks = function (amount) {

    var priceBuffer = this.priceToBuyStock();

    if (!this.player().bank().tryWithdraw(priceBuffer)) {
        
        return false;
    }

    var playerStockCollection = this.player().purchasedStock();
    var company = this.selectedCompany();
    var ownedStock = (playerStockCollection[company.companyName()] || {}).amount || 0;

    ownedStock += amount;

    playerStockCollection[company.companyName()] = {
        amount: ownedStock,
        dividends: company.stockYield()
    };

    // Let the knockout binding know there has been a change
    this.player().purchasedStock(this.player().purchasedStock());
}

/**
 * Converts the ViewModel to JSON
 * @instance
 * @returns {Object}
 */
StockExchange.prototype.toJSON = function () {

    return {

        companies: this.companies(),
        ticker: this.ticker,
        selectedCompany: this.selectedCompany() !== null ? this.selectedCompany().companyName() : null
    };
}

/**
 * Creates a new stock exchange
 * @param {Player} player - A reference to the current player
 * @returns {StockExchange}
 */
StockExchange.create = function (player) {

    var stockExchange = new StockExchange();
    var companies = [];

    for (var companyIndex = 0; companyIndex < gameConfig.defaultCompanies.length; companyIndex++) {

        var defaultCompany = gameConfig.defaultCompanies[companyIndex];
        var generatedCompany = Company.createConfigured(defaultCompany);

        companies.push(generatedCompany);
    }

    stockExchange.companies(companies);
    stockExchange.player(player);

    return stockExchange;
}

/**
 * Restores a ViewModel from JSON
 * @param {Object} savedStockExchange - A JSON object that references a StockExchange
 * @param {Player} player - A reference to the current player
 * @returns {StockExchange}
 */
StockExchange.restore = function (savedStockExchange, player) {

    var stockExchange = new StockExchange();
    var companies = [];

    for (var companyIndex = 0; companyIndex < savedStockExchange.companies.length; companyIndex++) {

        var savedCompany = savedStockExchange.companies[companyIndex];
        var restoredCompany = Company.restore(savedCompany);

        companies.push(restoredCompany);
    }

    stockExchange.companies(companies);
    stockExchange.player(player);
    stockExchange.selectCompanyByName(savedStockExchange.selectedCompany);

    return stockExchange;
}