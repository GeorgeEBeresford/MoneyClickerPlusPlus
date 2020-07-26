/**
 * A company that provides a service or goods to customers
 * @class
 */
function Company() {

    var self = this;

    /**
     * The name of the current company
     * @type {KnockoutObservable<string>}
     * @instance
     */
    this.companyName = ko.observable(null);

    /**
     * The yield type of the company's stock (0 = none, 1 = very low, 2 = low, 3 = medium, 4 = large, 5 = very large)
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.stockYield = ko.observable(0);

    /**
     * The value of each unit of stock
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.stockValue = ko.observable(0);

    /**
     * A history of recent changes to the values of each company
     * @type {KnockoutObservableArray<Number>}
     * @instance
     */
    this.valueHistory = ko.observableArray([]);

    /**
     * The date that the company was last updated on
     * @type {Date}
     * @instance
     */
    this.lastUpdated = ko.observable();

    /**
     * Whether the current company is a default company that was created from the configuration file
     * @type {Boolean}
     * @instance
     */
    this.isDefault = false;

    /**
     * Calculates the difference between the last company value and the current company value
     * @type {KnockoutObservable<Number>}
     * @instance
     */
    this.stockValueChange = ko.computed(function () {

        if (self.valueHistory().length < 2) {

            return 0;
        }

        var oldestValue = self.valueHistory()[0];
        var difference = self.stockValue() - oldestValue;

        return difference;
    });

    this.valueHistoryTrend = ko.computed(function() {

        var trendPoints = [];

        for (var valueIndex = 0; valueIndex < self.valueHistory().length; valueIndex++) {

            var historicValue = self.valueHistory()[valueIndex];
            var indexOfValue = self.historicValuesAscendingOrder().indexOf(historicValue);

            var coordinateX = valueIndex * 10;
            var coordinateY = 100 - (indexOfValue * 10);

            trendPoints.push(coordinateX + "," + coordinateY)
        }

        var trend = trendPoints.join(" ");

        return trend;
    })

    /**
     * The company's historic values ordered by lowest to highest (the company's current value is included in this)
     * @type {KnockoutComputed<Number>}
     * @instance
     */
    this.historicValuesAscendingOrder = ko.computed(function() {

        var historyBuffer = self.valueHistory().slice(0);
        
        var uniqueValues = [];

        for (var valueIndex = 0; valueIndex < historyBuffer.length; valueIndex++) {

            var currentValue = historyBuffer[valueIndex];
            var isUnique = uniqueValues.indexOf(currentValue) === -1;

            if (isUnique) {

                uniqueValues.push(currentValue);
            }
        }

        var orderedValues = uniqueValues.sort(function(previousValue, currentValue) {

            return previousValue - currentValue;
        });

        return orderedValues;
    });
}

/**
 * The maximum number of records to keep for the company's value history
 * @type {Number}
 */
Company.maxHistoryLength = 11;

/**
 * Creates a pre-configured company
 * @param {Object} configuredCompany - A company, as described in the configuration file
 * @returns {Company}
 */
Company.createConfigured = function (configuredCompany) {

    var company = new Company();

    company.stockYield(configuredCompany.stockYield);
    company.stockValue(configuredCompany.stockValue);
    company.lastUpdated(new Date());
    company.companyName(configuredCompany.companyName);
    company.valueHistory([configuredCompany.stockValue]);
    company.isDefault = true;

    return company;
}

/**
 * Restores a saved company from JSON
 * @param {Object} savedCompany - A JSON object representing a company
 * @returns {Company}
 */
Company.restore = function (savedCompany) {

    if (savedCompany === null) {

        return null;
    }

    var company = new Company();

    company.stockYield(savedCompany.stockYield);
    company.stockValue(savedCompany.stockValue);
    company.lastUpdated(new Date(savedCompany.lastUpdated));
    company.companyName(savedCompany.companyName);
    company.valueHistory(savedCompany.valueHistory);
    company.isDefault = savedCompany.isDefault;

    return company;
}

/**
 * Converts the ViewModel into JSON
 * @instance
 * @returns {Object}
 */
Company.prototype.toJSON = function () {

    return {

        companyName: this.companyName(),
        stockYield: this.stockYield(),
        stockValue: this.stockValue(),
        lastUpdated: this.lastUpdated().toISOString(),
        valueHistory: this.valueHistory(),
        isDefault: this.isDefault
    };
}

/**
 * Makes random changes to the company
 * @instance
 */
Company.prototype.makeRandomChange = function () {

    // The value history has a maximum number of records. Make sure we don't exceed it.
    if (this.valueHistory().length === Company.maxHistoryLength) {
        
        this.valueHistory.shift();
    }

    var noChangeRoll = MathsLibrary.getRandomNumber(0, 100);

    if (noChangeRoll < 20) {

        // Archive the current value of the company
        this.valueHistory.push(this.stockValue());
        return;
    }

    var modificationIsLargeRoll = MathsLibrary.getRandomNumber(0, 100);
    var modification = 0;

    if (modificationIsLargeRoll < 0.0001) {

        modification = MathsLibrary.getRandomNumber(8, 10);
    }
    else {

        modification = MathsLibrary.getRandomNumber(0.01, 0.75);
    }

    var goodOrBadRoll = MathsLibrary.getRandomNumber(0, 100);

    if (goodOrBadRoll < 50) {

        modification = 0 - modification;
    }
    
    this.lastUpdated(new Date());

    var roundedValue = MathsLibrary.round(this.stockValue() + modification, 2);

    // A company can't have stocks worth negative dollars. It'd go bankrupt!
    if (roundedValue < 0) {

        roundedValue = 0;
    }

    // Modify the value of the company
    this.stockValue(roundedValue);

    // Archive the current value of the company
    this.valueHistory.push(this.stockValue());
}