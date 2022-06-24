/**
 * Represents a StockExchange that has been saved as JSON
 */
interface ISavableStockExchange {

    companies: Array<ISavableCompany>;
    selectedCompany: string | null;
    stockToBuy: number;
}

/**
 * An object that allows the viewing, purchasing and selling of stocks for different companies
 * @class
 */
class StockExchange {

    /**
     * A reference to the current player
     */
    public readonly player: ko.Observable<Player>;

    /**
     * A collection of companies referenced by the stock market
     */
    public readonly companies: ko.ObservableArray<Company>;

    /**
     * The company that is currently selected by the player
     */
    public readonly selectedCompany: ko.Observable<Company | null>;

    /**
     * The number of units of stock that the player wishes to buy
     */
    public readonly stockAmountToBuy: ko.Observable<string>;

    /**
     * The calculated cost of buying the specified number of stock units
     */
    public readonly priceToBuyStock: ko.Computed<number>;

    /**
     * Retrieves an array containing the companies that the player owns shares in. This can then be observed by the view
     */
    public readonly playerInvestedCompanies: ko.Computed<Array<Company>>;

    /**
     * Creates a new StockExchange
     * @param player - A reference to the current player so we can track their owned stock // Todo - refactor this out of the Player object and into the StockExchange object
     */
    constructor(player: Player) {
            
        this.player = ko.observable(player);

        const companies: Array<Company> = [];
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
            })

            return filteredCompanies;
        })

        this.selectedCompany = ko.observable(null);
        this.stockAmountToBuy = ko.observable("1");
        this.priceToBuyStock = ko.computed(() => {

            const company = this.selectedCompany();
            if (company === null){

                return 0;
            }

            if (isNaN(+this.stockAmountToBuy())){

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
    public static restore(savedStockExchange: ISavableStockExchange | null, player: Player): StockExchange {

        var stockExchange = new StockExchange(player);

        if (savedStockExchange !== null){

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
    public selectCompanyByName(companyName: string): void {

        var matchingCompany = this.companies().find(potentialCompany => {

            return potentialCompany.companyName() === companyName;
        });

        if (matchingCompany !== undefined){

            this.selectedCompany(matchingCompany);
        }
    }

    /**
     * Attempts to sell a specified number of stocks. If the player doesn't have enough stocks to sell, no stocks will be sold
     * @returns whether the player has enough stocks to sell
     */
    public trySellStocks(): boolean {

        var playerStockCollection = this.player().purchasedStock();
        var company = this.selectedCompany();

        if (company === null) {

            return false;
        }

        if (isNaN(+this.stockAmountToBuy())){

            return false;
        }

        var ownedStock = playerStockCollection[company.companyName()];

        if (ownedStock.amount < +this.stockAmountToBuy()) {

            return false;
        }

        var totalStockvalue = this.priceToBuyStock();

        ownedStock.amount -= +this.stockAmountToBuy()

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
    public tryPurchaseStocks(): boolean {

        var priceBuffer = this.priceToBuyStock();

        if (!this.player().bank().tryWithdraw(priceBuffer)) {

            return false;
        }

        if (isNaN(+this.stockAmountToBuy())){

            return false;
        }

        var playerStockCollection = this.player().purchasedStock();
        var company = this.selectedCompany();
        
        if (company === null){

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
    public toJSON(): ISavableStockExchange {

        const company = this.selectedCompany();

        return {

            companies: this.companies().filter(company => !company.isSystemOwned).map(company => company.toJSON()),
            selectedCompany: company !== null ? company.companyName() : null,
            stockToBuy: !isNaN(+this.stockAmountToBuy()) ? +this.stockAmountToBuy() : 0
        };
    }
}