/**
 * Represents a bank that has been saved as JSON
 */
interface ISavableBank {

    balance: number;
}

/**
 * An object representing a bank to hold the currency of the player
 * @class
 */
class Bank {

    /**
     * The current balance of the player
     * @instance
     * @type {KnockoutObservable<Number>}
     */
    public readonly balance: ko.Observable<number>;

    /**
     * The current balance of the player formatted a way that is nice to look at
     * @instance
     * @type {KnockoutComputed<String>}
     */
     public readonly balancePreview: ko.Computed<string>;

    /**
     * Creates a new Bank
     */
    constructor() {

       this.balance = ko.observable(0);
       this.balancePreview = ko.computed(() => {

            var flooredMoney = Math.floor(this.balance() * 100) / 100;
            var formattedMoney = `$${flooredMoney.toFixed(2)}`;

            return formattedMoney;
        });
    }

    /**
     * Restores a Bank from JSON
     * @param savedBank - A JSON object representing a Bank
     * @param savedBank the restored Bank
     */
    public static restore(savedBank: ISavableBank): Bank {

        var bank = new Bank();
    
        if (savedBank !== null){
            
            bank.balance(savedBank.balance);
        }
    
        return bank;
    }

    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    public toJSON(): ISavableBank {
        
        return {

            // Balance was being saved with absurd number of decimal places
            balance: MathsLibrary.floor(this.balance(), 2)
        };
    }

    /**
     * Deposits a specified amount of currency into the bank
     * @param amount - The amount of currency to deposit
     */
    public deposit(amount: number): void {
        
        /**
         * You can't have 0.001 dollars. It's just not possible.
         */
        amount = MathsLibrary.floor(amount, 2);
        
        this.balance(this.balance() + MathsLibrary.round(amount, 2));
    }

    /**
     * Attempts to withdraw an amount of money out for the player. No money is withdrawn if the player does not have enough funds to cover the cost
     * @param amount - The amount which needs to be withdrawn
     * @returns whether the player has enough funds to cover the cost
     */
    public tryWithdraw(amount: number): boolean {
        
        /**
         * You can't have 0.001 dollars. It's just not possible.
         */
        amount = MathsLibrary.floor(amount, 2);

        if (this.balance() < amount) {

            return false;
        }

        this.balance(this.balance() - amount);

        return true;
    }
}