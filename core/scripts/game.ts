/**
 * Represents a Game that has been saved as JSON
 */
interface ISavableGame {

    player: ISavablePlayer;
    moneyGenerator: ISavableMoneyGenerator;
    currentPanel: string;
    ticker: ISavableTicker;
}

/**
 * The main controller for the game
 */
class Game {

    /**
     * The first panel that the player will see upon entering the game
     */
    public static readonly defaultPanel = "MoneyGenerator";

    /**
     * A reference to the current player
     */
    public readonly player: ko.Observable<Player>;

    /**
     * Generates money out of thin air for the player
     */
    public readonly moneyGenerator: ko.Observable<MoneyGenerator>;

    /**
     * The currently displayed panel
     */
    public readonly currentPanel: ko.Observable<string>;

    /**
     * A ticker that keeps track of changes to each company
     */
    public readonly ticker: ko.Observable<Ticker>;

    /**
     * Creates a new Game
     */
    constructor(player: Player, moneyGenerator: MoneyGenerator, ticker: Ticker) {
        
        this.player = ko.observable(player);
        this.moneyGenerator = ko.observable(moneyGenerator);
        this.ticker = ko.observable(ticker);
        
        this.currentPanel = ko.observable(Game.defaultPanel);

        this.initialise();
    }

    /**
     * Restores a game from saved JSON
     * @returns the restored Game
     */
    public static restore(savedGame: ISavableGame | null): Game {
        
        if (savedGame !== null) {
    
            const savedPlayer = Player.restore(savedGame.player);
            const savedMoneyGenerator = MoneyGenerator.restore(savedGame.moneyGenerator, savedPlayer);
            const savedTicker = Ticker.restore(savedGame.ticker, savedPlayer);
            const game = new Game(savedPlayer, savedMoneyGenerator, savedTicker)
            
            game.currentPanel(savedGame.currentPanel);
            return game;
        }

        const player = Player.restore(null);
        const moneyGenerator = MoneyGenerator.restore(null, player);
        const ticker = Ticker.restore(null, player);

        var game = new Game(player, moneyGenerator, ticker);
        return game;
    }

    /**
     * Changes the currently visible panel to the specified string
     * @param panelName - The name of the panel which should be visible
     */
    public changePanel(panelName: string): void {

        this.currentPanel(panelName);

        // Reset their company selection so the player is presented with a fresh panel
        this.ticker().stockExchange().selectedCompany(null);
    }

    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    public toJSON(): ISavableGame {

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
    private initialise(): void {
        
        this.moneyGenerator().watchCurrentTime();
        this.ticker().startTicking();
    }
}