import * as ko from "./common/knockout";
import MoneyGenerator from "./money/money-generator";
import Ticker from "./companies/ticker";
import Player from "./player/player";
/**
 * The main controller for the game
 */
export default class Game {
    /**
     * Creates a new Game
     */
    constructor(player, moneyGenerator, ticker) {
        this.player = ko.observable(player);
        this.moneyGenerator = ko.observable(moneyGenerator);
        this.ticker = ko.observable(ticker);
        this.isNavigationBarShown = ko.observable(false);
        this.currentPanel = ko.observable(Game.defaultPanel);
        this.initialise();
        this.generateStockRevenue();
    }
    /**
     * Restores a game from saved JSON
     * @returns the restored Game
     */
    static restore(savedGame) {
        if (savedGame !== null) {
            const savedPlayer = Player.restore(savedGame.player);
            const savedMoneyGenerator = MoneyGenerator.restore(savedGame.moneyGenerator);
            const savedTicker = Ticker.restore(savedGame.ticker, savedPlayer);
            const game = new Game(savedPlayer, savedMoneyGenerator, savedTicker);
            game.currentPanel(savedGame.currentPanel);
            return game;
        }
        const player = Player.restore(null);
        const moneyGenerator = MoneyGenerator.restore(null);
        const ticker = Ticker.restore(null, player);
        var game = new Game(player, moneyGenerator, ticker);
        return game;
    }
    /**
     * Changes the currently visible panel to the specified string
     * @param panelName - The name of the panel which should be visible
     */
    changePanel(panelName) {
        this.currentPanel(panelName);
        // Reset their company selection so the player is presented with a fresh panel
        this.ticker().stockExchange().selectedCompany(null);
        // After changing the panel, hide the menu for mobile users
        this.isNavigationBarShown(false);
    }
    /**
     * Toggles whether the navigation bar is displayed
     */
    toggleIsNavigationBarShown() {
        this.isNavigationBarShown(!this.isNavigationBarShown());
    }
    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    toJSON() {
        return {
            player: this.player().toJSON(),
            moneyGenerator: this.moneyGenerator().toJSON(),
            ticker: this.ticker().toJSON(),
            currentPanel: this.currentPanel()
        };
    }
    /**
     * Initialises any objects that make up the current view model
     */
    initialise() {
        this.moneyGenerator().watchCurrentTime();
        this.ticker().startTicking();
    }
    /**
     * Generate money for the player every minute from dividends
     */
    generateStockRevenue() {
        const player = this.player();
        const bank = player.bank();
        const ticker = this.ticker();
        setInterval(() => {
            var moneyPerMinute = ticker.incomePerMinute();
            bank.deposit(moneyPerMinute);
        }, 60000);
    }
}
/**
 * The first panel that the player will see upon entering the game
 */
Game.defaultPanel = "MoneyGenerator";
//# sourceMappingURL=game.js.map