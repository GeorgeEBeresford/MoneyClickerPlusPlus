/**
 * A root object for any default game settings
 */
interface IGameConfig {

    /**
     * A collection of default companies to start off with
     */
    defaultCompanies: Array<ISystemCompany>;
}

/**
 * A company that is owned by the application
 */
interface ISystemCompany {

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

var gameConfig: IGameConfig = {

    defaultCompanies: [
        // No dividends
        {
            companyName: "Facepage",
            industry: "Social Media",
            stockType: 0,
            currentValue: 22837748038
        },
        // Low dividends
        {
            companyName: "Llynx",
            industry: "Hygiene",
            stockType: 1,
            currentValue: 41726639837
        },
        {
            companyName: "Sainsberries",
            industry: "Retail",
            stockType: 1,
            currentValue: 41827738938
        },
        {
            companyName: "Cooprative",
            industry: "Retail",
            stockType: 1,
            currentValue: 41283748948
        },
        // Medium dividends
        {
            companyName: "Electronic Poptarts",
            industry: "Digital Games",
            stockType: 2,
            currentValue: 142837749837
        },
        {
            companyName: "Toys 'R' We",
            industry: "Childrens' Toys",
            stockType: 2,
            currentValue: 142837038927
        },
        {
            companyName: "AMB Technologies",
            industry: "Electronics",
            stockType: 2,
            currentValue: 142948958859
        },
        {
            companyName: "Pixelar",
            industry: "Animation",
            stockType: 2,
            currentValue: 142928837748
        },
        // High dividends
        {
            companyName: "Rolléx",
            industry: "Fashion",
            stockType: 3,
            currentValue: 17837748948
        },
        {
            companyName: "Intelligence Inside",
            industry: "Electronics",
            stockType: 3,
            currentValue: 17827738938
        },
        // Very high dividends
        {
            companyName: "INTEW Holdings",
            industry: "Film",
            stockType: 4,
            currentValue: 18837432439
        }
    ]
}