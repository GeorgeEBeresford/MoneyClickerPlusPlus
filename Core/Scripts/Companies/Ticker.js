/**
 * An object that monitors the different companies and provides statistics for how well each company is doing
 * @class
 */
function Ticker() {

    var self = this;

    /**
     * The delay between the ticker changes
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.tickerInterval = ko.observable(0);

    /**
     * The maximum number of previewed companies
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.maxPreviewedCompanies = ko.observable(0);

    /**
     * A market for buying, selling and viewing stocks
     * @type {KnockoutObservable<StockExchange>}
     * @instance
     */
    this.stockExchange = ko.observable(null);

    /**
     * A limited number of companies sorted by the date they were last changed
     * @type {KnockoutComputed<CompanyViewModel>}
     * @instance
     */
    this.companiesPreview = ko.computed(function() {

        if (self.stockExchange() === null) {

            return [];
        }

        var companies = self.stockExchange().companies();

        var filteredCompanies = companies.filter(function(company) {

            return company.stockValueChange() !== 0;
        });

        var sortedCompanies = filteredCompanies.sort(function(previousCompany, currentCompany) {

            return currentCompany.lastUpdated().getTime() - previousCompany.lastUpdated().getTime();
        })

        return sortedCompanies.slice(0, self.maxPreviewedCompanies());
    });
}

/**
 * Creates a brand new ticker
 * @param {Bank} bank - A reference to the player's bank, to ensure they have enough funds for any purchases
 */
Ticker.create = function (bank) {

    var ticker = new Ticker();

    ticker.maxPreviewedCompanies(5);
    ticker.stockExchange(StockExchange.create(bank));
    ticker.tickerInterval(5000);

    return ticker;
}

/**
 * Restores a Ticker object that has been saved
 * @param {Object} savedTicker - A JSON object representing a ViewModel
 * @param {Bank} bank - A reference to the player's bank, to ensure they have enough funds for any purchases
 */
Ticker.restore = function (savedTicker, bank) {

    if (savedTicker === null) {

        return null;
    }

    var ticker = new Ticker();

    ticker.maxPreviewedCompanies(savedTicker.maxPreviewedCompanies);
    ticker.stockExchange(StockExchange.restore(savedTicker.stockExchange, bank));
    ticker.tickerInterval(savedTicker.tickerInterval)

    return ticker;
}

/**
 * Converts the current ViewModel to JSON
 * @instance
 * @returns {Object}
 */
Ticker.prototype.toJSON = function() {

    return {

        maxPreviewedCompanies: this.maxPreviewedCompanies(),
        stockExchange: this.stockExchange(),
        tickerInterval: this.tickerInterval()
    };
}

/**
 * Starts ticking over and updating the companies over time
 * @instance
 */
Ticker.prototype.startTicking = function() {

    var self = this;
    var tickerDelay = self.tickerInterval();

    var interval = setInterval(function() {

        var companies = self.stockExchange().companies();

        for (var companyIndex = 0; companyIndex < companies.length; companyIndex++) {

            var company = companies[companyIndex];
            company.makeRandomChange();
        }

    }, tickerDelay);

    self.tickerInterval.subscribe(function() {

        clearInterval(interval);
        self.startTicking();
    })
}