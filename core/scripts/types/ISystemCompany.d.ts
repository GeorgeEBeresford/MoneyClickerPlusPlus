/**
 * A company that is owned by the application
 */
export default interface ISystemCompany {

    /*
     * The name of the company
     */
    companyName: string;

    /**
     * The industry of the company
     */
    industry: string;

    /**
     * The type of stock the company has (0: No dividends, 1: Low dividend, 2: Medium dividend, 3: High dividend, 4: Very high dividend)
     */
    stockType: number;

    /**
     * An initial company value to give the company
     */
    currentValue: number;
}