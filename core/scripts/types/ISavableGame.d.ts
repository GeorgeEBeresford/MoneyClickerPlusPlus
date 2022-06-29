/**
 * Represents a Game that has been saved as JSON
 */
export default interface ISavableGame {

    player: ISavablePlayer;
    moneyGenerator: ISavableMoneyGenerator;
    currentPanel: string;
    ticker: ISavableTicker;
}