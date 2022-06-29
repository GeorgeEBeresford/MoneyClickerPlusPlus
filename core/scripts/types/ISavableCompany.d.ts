import ICompanyValueChange from "./ICompanyValueChange";

/**
 * Represents a Company that has been saved as JSON
 */
 export default interface ISavableCompany {
    
    companyName: string;
    industry: string;
    stockType: number;
    lastUpdated: string;
    currentValue: number;
    audits: Array<ICompanyValueChange>;
}