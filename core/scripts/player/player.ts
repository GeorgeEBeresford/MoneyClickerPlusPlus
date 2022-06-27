/**
 * Represents a Player that has been saved as JSON
 */
interface ISavablePlayer {

    bank: ISavableBank;
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
     * Creates a new Player
     */
    constructor(bank: Bank) {

        this.bank = ko.observable(bank);
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

            bank: this.bank().toJSON()
        };
    }
}