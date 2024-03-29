import * as ko from "../common/knockout";
import StockExchange from "./stock-exchange";
import ISavableTicker from "../types/ISavableTicker";
import Company from "./company";
import Player from "../player/player";

/**
 * An object that monitors the different companies and provides statistics for how well each company is doing
 */
export default class Ticker {

    /**
     * The delay between the ticker changes
     */
    public readonly tickerInterval: ko.Observable<number>;

    /**
     * The maximum number of previewed companies
     */
    public readonly maxPreviewedCompanies: ko.Observable<number>;

    /**
     * A market for buying, selling and viewing stocks
     */
    public readonly stockExchange: ko.Observable<StockExchange>;

    /**
     * A limited number of companies sorted by the date they were last changed
     */
    public readonly companiesPreview: ko.Computed<Array<Company>>;

    /**
     * Calculates the amount of money the current player is making per minute via the ticker's descendants
     */
    public readonly incomePerMinute: ko.Computed<number>;

    /**
     * Creates a new Ticker
     * @param stockExchange - The stock exchange which we'll use to keep track of stocks and stock values
     */
    constructor(stockExchange: StockExchange) {
        
        this.tickerInterval = ko.observable(5000);
        this.maxPreviewedCompanies = ko.observable(5);
        this.stockExchange = ko.observable(stockExchange);
        this.companiesPreview = ko.computed(() => {

            const stockExchange = this.stockExchange();
            if (stockExchange === null) {

                return [];
            }

            const maxPreviewedCompanies = this.maxPreviewedCompanies();
            const companies = stockExchange.companies();

            const filteredCompanies = companies.filter((company) => {

                return company.stockValueChange() !== 0;
            });

            const sortedCompanies = filteredCompanies.sort((previousCompany, currentCompany) => {

                return currentCompany.lastUpdated().getTime() - previousCompany.lastUpdated().getTime();
            });

            const preview = sortedCompanies.slice(0, maxPreviewedCompanies);

            return preview;
        });
        
        this.incomePerMinute = ko.computed(() => {

            const stockExchange = this.stockExchange();

            // This will expand over time to other sources of income
            const moneyFromDividendsPerMinute = stockExchange.stockIncomePerMinute();

            return moneyFromDividendsPerMinute;
        })
    }

    /**
     * Restores a Ticker object that has been saved
     * @param savedTicker - A JSON object representing a ViewModel
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     * @returns the restored Ticker object
     */
    public static restore(savedTicker: ISavableTicker | null, player: Player): Ticker {

        if (savedTicker !== null){

            const savedStockExchange = StockExchange.restore(savedTicker.stockExchange);
            const ticker = new Ticker(savedStockExchange);
            ticker.maxPreviewedCompanies(savedTicker.maxPreviewedCompanies);
            ticker.tickerInterval(savedTicker.tickerInterval)

            return ticker;
        }

        const stockExchange = StockExchange.restore(null);
        const ticker = new Ticker(stockExchange);
    
        return ticker;
    }

    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    public toJSON(): ISavableTicker {

        return {

            maxPreviewedCompanies: this.maxPreviewedCompanies(),
            stockExchange: this.stockExchange().toJSON(),
            tickerInterval: this.tickerInterval()
        };
    }

    /**
     * Starts ticking over and updating the companies over time
     */
    public startTicking(): void {
            
        const tickerDelay = this.tickerInterval();
        const stockExchange = this.stockExchange();

        const interval = setInterval(() => {

            const companies = stockExchange.companies();
            companies.forEach(company => {

                company.makeRandomChange();
            });

        }, tickerDelay);

        this.tickerInterval.subscribe(() => {

            clearInterval(interval);
            this.startTicking();
        });
    }
}