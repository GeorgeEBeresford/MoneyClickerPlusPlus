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
     * Retrieves an array containing the companies that the player owns shares in. This can then be observed by the view
     * @type {KnockoutComputed<Company>}
     */
    this.playerInvestedCompanies = ko.computed(function() {
        
        if (self.player() === null) {

            return [];
        }

        var companiesBuffer = self.companies();
        var playerInvestmentsBuffer = Object.keys(self.player().purchasedStock());

        var filteredCompanies = companiesBuffer.filter(function(potentialPlayerInvestment) {

            var companyName = potentialPlayerInvestment.companyName();
            var isInvestment = playerInvestmentsBuffer.indexOf(companyName) !== -1;

            return isInvestment && self.player().purchasedStock()[companyName].amount !== 0;
        })

        return filteredCompanies;
    })

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

        if (isNaN(self.stockAmountToBuy())) {

            return 0;
        }

        if (companyBuffer === null) {

            return 0;
        }

        var stockAmount = parseInt(self.stockAmountToBuy());
        var price = stockAmount * companyBuffer.stockValue();

        return MathsLibrary.round(price, 2);
    })
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

    return stockExchange;
}

/**
 * Attempts to purchase a specified number of stocks. Returns true or false depending on whether the player can afford to
 * @param {Number} amount - The number of stocks to purchase
 */
StockExchange.prototype.trySellStocks = function () {

    if (isNaN(this.stockAmountToBuy()) || this.stockAmountToBuy() === "0") {

        return false;
    }

    var playerStockCollection = this.player().purchasedStock();
    var company = this.selectedCompany();
    var ownedStock = playerStockCollection[company.companyName()];

    if (ownedStock.amount < this.stockAmountToBuy()){

        return false;
    }
    
    var totalStockvalue = this.priceToBuyStock();

    ownedStock.amount -= parseInt(this.stockAmountToBuy());

    // Since we no longer own any of these stocks, we can safely discard this
    if (ownedStock.length === 0) {

        ownedStock.valueWhenPurchased = 0;
    }

    this.player().bank().deposit(totalStockvalue);

    // Let the knockout binding know there has been a change
    this.player().purchasedStock(this.player().purchasedStock());
}


/**
 * Attempts to purchase a specified number of stocks. Returns true or false depending on whether the player can afford to
 * @param {Number} amount - The number of stocks to purchase
 */
StockExchange.prototype.tryPurchaseStocks = function () {

    var priceBuffer = this.priceToBuyStock();

    if (isNaN(this.stockAmountToBuy())) {

        return false;
    }

    if (!this.player().bank().tryWithdraw(priceBuffer)) {
        
        return false;
    }

    var playerStockCollection = this.player().purchasedStock();
    var company = this.selectedCompany();
    var ownedStock = playerStockCollection[company.companyName()];

    if (typeof(ownedStock) === "undefined") {
        
        ownedStock = playerStockCollection[company.companyName()] = {
            amount: 0,
            dividends: company.stockYield(),
            valueWhenPurchased: company.stockValue()
        };
    }

    ownedStock.amount += parseInt(this.stockAmountToBuy());

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
        ticker: this.ticker
    };
}