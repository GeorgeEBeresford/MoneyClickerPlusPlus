import * as ko from "../common/knockout";
import MathsLibrary from "../common/maths-library";
/**
 * A company that provides a service or goods to customers
 */
export default class Company {
    /**
     * Creates a new Company
     * @param isSystemOwned - Whether the company is owned by the application
     */
    constructor(isSystemOwned) {
        this.isSystemOwned = isSystemOwned;
        this.companyName = ko.observable("");
        this.industry = ko.observable("");
        this.stockType = ko.observable(0);
        this.audits = ko.observableArray([]);
        this.lastUpdated = ko.observable(new Date(0));
        this.currentValue = ko.observable(0);
        this.latestAudit = ko.computed(() => {
            const audits = this.audits();
            const latestAudit = audits[audits.length - 1];
            return latestAudit;
        });
        this.stockValueChange = ko.computed(() => {
            const audits = this.audits();
            if (audits.length < 2) {
                return 0;
            }
            const previousAudit = audits[audits.length - 2];
            const previousValue = previousAudit.pricePerStock;
            const latestValue = this.currentValue();
            const difference = latestValue - previousValue;
            return difference;
        });
        this.historicValuesAscendingOrder = ko.computed(() => {
            const audits = this.audits();
            const uniqueValues = [];
            audits.forEach(auditedChange => {
                const isUnique = uniqueValues.find(value => value.pricePerStock === auditedChange.pricePerStock) === undefined;
                if (isUnique) {
                    uniqueValues.push(auditedChange);
                }
            });
            const orderedValues = uniqueValues.sort(function (previousChange, currentChange) {
                return previousChange.pricePerStock - currentChange.pricePerStock;
            });
            return orderedValues;
        });
        this.valueHistoryTrend = ko.computed(() => {
            const trendPoints = [];
            const uniqueChanges = this.historicValuesAscendingOrder();
            this.audits().forEach((auditedChange, valueIndex) => {
                const matchingValue = uniqueChanges.find(uniqueChange => uniqueChange.pricePerStock === auditedChange.pricePerStock);
                if (matchingValue !== undefined) {
                    const indexOfValue = uniqueChanges.indexOf(matchingValue);
                    const coordinateX = valueIndex * 10;
                    const coordinateY = 100 - (indexOfValue * 10);
                    trendPoints.push(coordinateX + "," + coordinateY);
                }
            });
            const trend = trendPoints.join(" ");
            return trend;
        });
        this.dividendsDescriptor = ko.computed(() => {
            const stockType = this.stockType();
            switch (stockType) {
                case (0): return "no";
                case (1): return "low";
                case (2): return "medium";
                case (3): return "high";
                case (4): return "very high";
                default:
                    console.error(`No descriptor for stockYield ${stockType}`);
                    throw `No descriptor for stockYield ${stockType}`;
            }
        });
        this.pricePerStock = ko.computed(() => {
            const currentValue = this.currentValue();
            const stockType = this.stockType();
            let pricePerStock = 0;
            switch (stockType) {
                // No dividends
                case 0:
                    pricePerStock = MathsLibrary.round(currentValue / 850000000, 2);
                    break;
                // Low dividends
                case 1:
                    pricePerStock = MathsLibrary.round(currentValue / 1300000000, 2);
                    break;
                // Medium dividends
                case 2:
                    pricePerStock = MathsLibrary.round(currentValue / 2000000000, 2);
                    break;
                // High dividends
                case 3:
                    pricePerStock = MathsLibrary.round(currentValue / 400000000, 2);
                    break;
                // Very high dividends
                case 4:
                    pricePerStock = MathsLibrary.round(currentValue / 390000000, 2);
                    break;
                default:
                    console.error(`Stock type ${stockType} is not configured. Can't calculate the price of purchasing 1 stock`);
                    throw `Stock type ${stockType} is not configured. Can't calculate the price of purchasing 1 stock`;
            }
            return pricePerStock;
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
        company.companyName(systemCompany.companyName);
        company.industry(systemCompany.industry);
        company.stockType(systemCompany.stockType);
        company.lastUpdated(new Date(0));
        company.currentValue(systemCompany.currentValue);
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
        company.companyName(savedCompany.companyName);
        company.industry(savedCompany.industry);
        company.stockType(savedCompany.stockType);
        company.lastUpdated(new Date(savedCompany.lastUpdated));
        company.currentValue(savedCompany.currentValue);
        // Add some initial changes to the company so we have some initial graph data to work with
        for (let index = 0; index < Company.maxHistoryLength; index++) {
            company.makeRandomChange();
        }
        return company;
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        return {
            companyName: this.companyName(),
            industry: this.industry(),
            stockType: this.stockType(),
            audits: this.audits(),
            currentValue: this.currentValue(),
            lastUpdated: this.lastUpdated().toISOString()
        };
    }
    /**
     * Makes random changes to the company
     */
    makeRandomChange() {
        const noChangeRoll = MathsLibrary.getRandomNumber(0, 100);
        if (noChangeRoll < 20) {
            // Archive the current value of the company
            this.audits.push({ pricePerStock: this.pricePerStock(), percentageChange: 0 });
        }
        else {
            const modificationIsLargeRoll = MathsLibrary.getRandomNumber(0, 100);
            let modification = modificationIsLargeRoll < 0.0001 ? MathsLibrary.getRandomNumber(10, 15) : MathsLibrary.getRandomNumber(0.2, 3);
            const goodOrBadRoll = MathsLibrary.getRandomNumber(0, 100);
            modification = goodOrBadRoll < 50 ? 0 - modification : modification;
            const roundedModification = MathsLibrary.round(modification, 2);
            // Raise or decrease the stock value by a percentage, not the exact number
            const currentValue = this.currentValue();
            const roundedValue = MathsLibrary.round(currentValue + currentValue * (roundedModification / 100), 2);
            this.currentValue(roundedValue);
            const pricePerStock = this.pricePerStock();
            // Add the change as an audit
            this.audits.push({ pricePerStock: pricePerStock, percentageChange: roundedModification });
            this.lastUpdated(new Date());
        }
        // The value history has a maximum number of records. Make sure we don't exceed it.
        if (this.audits().length > Company.maxHistoryLength) {
            this.audits.shift();
        }
    }
}
/**
 * The maximum number of history records to keep for a company
 */
Company.maxHistoryLength = 11;
//# sourceMappingURL=company.js.map