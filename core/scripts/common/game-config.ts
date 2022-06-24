/**
 * A root object for any default game settings
 */
interface IGameConfig {

    defaultCompanies: Array<ISystemCompany>;
}

/**
 * A company that is owned by the application
 */
interface ISystemCompany {

    companyName: string;
    stockYield: number;
    stockValue: number;
}

var gameConfig: IGameConfig = {

    defaultCompanies: [
        {
            companyName: "Electronic Poptarts",
            stockYield: 3,
            stockValue: 42.22
        },
        {
            companyName: "Toys 'R' We",
            stockYield: 2,
            stockValue: 46.12
        },
        {
            companyName: "Rolléx",
            stockYield: 5,
            stockValue: 240.98
        },
        {
            companyName: "Llynx",
            stockYield: 2,
            stockValue: 41.46
        },
        {
            companyName: "Facepage",
            stockYield: 1,
            stockValue: 34.13
        },
        {
            companyName: "Intelligence Inside",
            stockYield: 4,
            stockValue: 203.67
        },
        {
            companyName: "AMB Technologies",
            stockYield: 4,
            stockValue: 90.54
        },
        {
            companyName: "Sainsberries",
            stockYield: 3,
            stockValue: 74.23
        },
        {
            companyName: "Cooprative",
            stockYield: 3,
            stockValue: 50.23
        },
        {
            companyName: "Pixelar",
            stockYield: 3,
            stockValue: 90.23
        },
        {
            companyName: "INTEW Holdings",
            stockYield: 5,
            stockValue: 285.86
        }
    ]
}