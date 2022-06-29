/**
     * Represents a StockExchange that has been saved as JSON
     */
export default interface ISavableStockExchange {

    companies: Array<ISavableCompany>;
    selectedCompany: string | null;
    stockToBuy: number;
    purchasedStock: Interfaces.IDictionary<IPurchasedStock>;
}