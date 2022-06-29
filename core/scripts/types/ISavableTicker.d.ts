/**
 * Represents a Ticker that has been saved as JSON
 */
export default interface ISavableTicker {

    maxPreviewedCompanies: number;
    stockExchange: ISavableStockExchange;
    tickerInterval: number;
}