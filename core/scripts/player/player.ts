/**
 * Represents stock that the player has purchased
 */
interface IPurchasedStock {

    /**
     * The value of the stock when it was last purchased
     */
    valueWhenPurchased: number;

    /**
     * The number of stocks we own in total
     */
    amount: number;

    /**
     * The number of dividends we're paid per interval
     */
    dividends: number;
}

/**
 * Represents a Player that has been saved as JSON
 */
interface ISavablePlayer {

    bank: ISavableBank;
    purchasedStock: IDictionary<IPurchasedStock>;
}

/**
 * An object representing the current player
 */
class Player {

    /**
     * The bank containing the player's money
     */
    public readonly bank: ko.Observable<Bank>;

    /**
     * An object which will keep track of how many stocks are owned for each company
     */
    public readonly purchasedStock: ko.Observable<IDictionary<IPurchasedStock>>;

    /**
     * Calculates the player's income per minute based off each company's dividends
     */
    public readonly getStockIncomePerMinute: ko.Computed<number>;

    /**
     * The amount of money the current player is making per minute
     */
    public readonly incomePerMinute: ko.Computed<number>;

    /**
     * Creates a new Player
     */
    constructor(bank: Bank) {

        this.bank = ko.observable(bank);
        this.purchasedStock = ko.observable({});

        this.getStockIncomePerMinute = ko.computed(() => {

            const purchasedStock = this.purchasedStock();
            const companyNames = Object.keys(purchasedStock);

            let dividends = 0;
            companyNames.forEach(companyName => {

                const stock = purchasedStock[companyName];
                dividends += stock.amount * stock.dividends;
            })

            return dividends;
        });

        this.incomePerMinute = ko.computed(() => {

            const incomePerMinute = this.getStockIncomePerMinute();
            const flooredIncome = MathsLibrary.floor(incomePerMinute, 2);

            return flooredIncome;
        });
    }

    /**
     * Restores a player object from JSON
     * @param savedPlayer - A JSON object referencing a player
     * @returns the restored Player object
     */
    public static restore(savedPlayer: ISavablePlayer | null): Player {

        if (savedPlayer !== null) {

            const savedBank = Bank.restore(savedPlayer.bank);
            const player = new Player(savedBank);
            player.purchasedStock(savedPlayer.purchasedStock);

            return player;
        }

        const bank = new Bank();
        const player = new Player(bank);
        return player;
    }

    /**
     * Creates a JSON object representing the current player
     * @returns the JSON object representing the current Player
     */
    public toJSON(): ISavablePlayer {

        return {

            bank: this.bank().toJSON(),
            purchasedStock: this.purchasedStock()
        };
    }
}