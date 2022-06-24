/**
 * Represents a MoneyGenerator that has been saved as JSON
 */
interface ISavableMoneyGenerator{

    baseCashPerClick: number;
    boostExpires: string;
}

/**
 * An object that can be used to generate money for the player from thin air
 */
class MoneyGenerator {

    /**
     * A reference to the current player
     */
    private readonly player: ko.Observable<Player>;

    /**
     * The amount of money that the player will receive without boosts
     */
    private readonly baseCashPerClick: ko.Observable<number>;

    /**
     * The time and date of when the money generator boost runs out
     */
    private readonly boostExpires: ko.Observable<Date>;

    /**
     * Calculates the number of seconds between the current date and time, and the time and date that the boost expires
     */
    private readonly boostedSecondsRemaining: ko.Computed<number>;

    /**
     * Calculates the cost of upgrading the money generator
     */
    private readonly upgradeCost: ko.Computed<number>;

    /**
     * Calculates how much money is generated for each click
     */
    private readonly cashPerClick: ko.Computed<number>;

    /**
     * Creates a new MoneyGenerator
     * @param player - The player which the MoneyGenerator should create money for
     */
    constructor(player: Player){

        this.player = ko.observable(player);
        this.baseCashPerClick = ko.observable(1);
        this.boostExpires = ko.observable(new Date(0));
    
        this.boostedSecondsRemaining = ko.computed(() => {
    
            if (this.boostExpires() === null) {
    
                return 0;
            }
    
            var boostedMillisecondsRemaining = (this.boostExpires().getTime() - new Date().getTime());
    
            if (boostedMillisecondsRemaining <= 0) {
    
                return 0;
            }
    
            var boostedSecondsRemaining = Math.ceil(boostedMillisecondsRemaining / 1000);
    
            return boostedSecondsRemaining;
        })
    
        this.upgradeCost = ko.computed(() => {
    
            var upgradeCost = 20 * Math.pow(this.baseCashPerClick(), 2);
            var flooredCost = MathsLibrary.floor(upgradeCost, 2);
    
            return flooredCost;
        })
    
        this.cashPerClick = ko.computed(() => {
    
            return this.boostExpires() > new Date() ? this.baseCashPerClick() * 2 : this.baseCashPerClick();
        })

        this.generateIncome();
    }

    /**
     * Restores a MoneyGenerator from JSON
     * @param savedMoneyGenerator - A JSON object representing the money generator
     * @returns the restored MoneyGenerator
     */
    public static restore(savedMoneyGenerator: ISavableMoneyGenerator | null, player: Player): MoneyGenerator {

        var moneyGenerator = new MoneyGenerator(player);

        if (savedMoneyGenerator !== null){

            moneyGenerator.baseCashPerClick(savedMoneyGenerator.baseCashPerClick);
            moneyGenerator.boostExpires(new Date(savedMoneyGenerator.boostExpires));
        }
    
        return moneyGenerator;
    }

    /**
     * Generates income for the player every minute
     */
    public generateIncome(): void {

        setInterval(() => {

            var moneyPerMinute = this.player().incomePerMinute();

            this.player().bank().deposit(moneyPerMinute);

        }, 60000);
    }

    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    public toJSON(): ISavableMoneyGenerator {

        return {

            baseCashPerClick: this.baseCashPerClick(),
            boostExpires: this.boostExpires().toISOString()
        };
    }

    /**
     * Calculates the cost of boosting the money generator for the specified number of seconds
     * @param seconds - The number of seconds to boost the generator for
     * @returns the cost of boosting the money generator for the specified number of seconds
     */
     public getBoostCost(seconds: number): number {

        var upgradeCost = seconds * Math.pow(this.baseCashPerClick(), 1.85);
        var flooredCost = MathsLibrary.floor(upgradeCost, 2);
    
        return flooredCost;
    }

    /**
     * Doubles the output of the boost generator for a limited number of seconds
     * @param seconds - The number of seconds to boost the generator for
     */
    public boostGenerator(seconds: number): void {

        var isWithdrawalSuccess = this.player().bank().tryWithdraw(this.getBoostCost(seconds));

        if (!isWithdrawalSuccess) {

            return;
        }

        var now = new Date();

        var newExpiration = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            now.getHours(), now.getMinutes(), now.getSeconds() + seconds
        );

        this.boostExpires(newExpiration);
    }

    /**
     * Generates money out of thin air for the player
     */
    public generateCash(): void {

        this.player().bank().deposit(this.cashPerClick())
    }

    /**
     * Upgrades the money generator to give 1 more currency per click
     */
    public upgradeGenerator(): void {

        var isWithdrawalSuccess = this.player().bank().tryWithdraw(this.upgradeCost());

        if (!isWithdrawalSuccess) {

            return;
        }

        this.baseCashPerClick(this.baseCashPerClick() + 1);
    }

    /**
     * Keeps an eye on the current time and refreshes any time-based displays
     */
    public watchCurrentTime(): void {

        setInterval(() => {

            // Refresh the expiration time every second
            this.boostExpires(this.boostExpires());

        }, 1000);
    }
}