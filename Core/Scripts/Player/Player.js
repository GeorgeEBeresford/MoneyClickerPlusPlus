"use strict";
/**
 * An object representing the current player
 */
class Player {
    /**
     * Creates a new Player
     */
    constructor(bank) {
        this.bank = ko.observable(bank);
    }
    /**
     * Restores a player object from JSON
     * @param savedPlayer - A JSON object referencing a player
     * @returns the restored Player object
     */
    static restore(savedPlayer) {
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
    toJSON() {
        return {
            bank: this.bank().toJSON()
        };
    }
}
//# sourceMappingURL=player.js.map