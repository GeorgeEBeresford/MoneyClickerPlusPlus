/**
 * Represents stock that the player has purchased
 */
export default interface IPurchasedStock {

    /**
     * The value of the stock when it was last purchased
     */
    valueWhenPurchased: number;

    /**
     * The number of stocks we own in total
     */
    amount: number;
}