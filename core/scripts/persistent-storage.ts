import * as ko from "./common/knockout";
import Game from "./game";
import ISavablePersistentStorage from "./types/ISavablePersistentStorage";

/**
 * An object which will serialise another object into a string and then save it into the LocalStorage
 */
export default class PersistentStorage {

    public static readonly storagePath = "moneyclicker++/savegame";

    /**
     * Sets the default number of seconds between saves, when none have been set by the player
     */
    private static readonly defaultTimeBetweenSaves = 1;

    /**
     * The currently watched object
     */
    public watchedGame: Game;

    /**
     * The number of seconds between each save
     */
    private readonly delayBetweenSaves: ko.Observable<number>;

    /**
     * The date that the last object was saved on
     */
    private readonly lastSavedOn: ko.Observable<Date>;

    /**
     * Creates a new PersistentStorage
     * @param storagePath - The path which the saved object will be stored under inside LocalStorage
     */
    constructor(watchedGame: Game) {
            
        this.watchedGame = watchedGame;

        this.delayBetweenSaves = ko.observable(PersistentStorage.defaultTimeBetweenSaves);

        this.lastSavedOn = ko.observable(new Date(0));
    }

    /**
     * Restores a PersistentStorage from JSON
     * @param savedPersistentStorage - A JSON object representing a PersistentStorage
     * @param storagePath - The path which the saved object will be stored under inside LocalStorage
     * @returns the restored PersistentStorage
     */
    public static restore(): PersistentStorage {

        const savedPersistentStorage = PersistentStorage.getDataFromStorage();

        if (savedPersistentStorage !== null){

            const game = Game.restore(savedPersistentStorage.game);
            const persistentStorage = new PersistentStorage(game);
    
            persistentStorage.delayBetweenSaves(savedPersistentStorage.delayBetweenSaves);
            persistentStorage.lastSavedOn(new Date(savedPersistentStorage.lastSavedOn));
            return persistentStorage;
        }

        const game = Game.restore(null);
        const persistentStorage = new PersistentStorage(game);

        return persistentStorage;
    }

    /**
     * Creates a new JSON object representing the current object
     * @returns the JSON object representing the current object
     */
    public toJSON(): ISavablePersistentStorage {

        return {

            delayBetweenSaves: this.delayBetweenSaves(),
            lastSavedOn: this.lastSavedOn().toISOString(),
            game: this.watchedGame.toJSON()
        };
    }

    /**
     * Saves the current object to the LocalStorage
     */
    public saveToLocalStorage(): void {

        this.lastSavedOn(new Date());

        const jsonObject = this.toJSON();
        const serialisedJSON = JSON.stringify(jsonObject);
        const localStorage = window.localStorage;

        localStorage.setItem(PersistentStorage.storagePath, serialisedJSON);
    }

    /**
     * Deletes the current save from the LocalStorage
     */
    public deleteSave(): void {

        this.lastSavedOn(new Date(0));

        const localStorage = window.localStorage;
        localStorage.removeItem(PersistentStorage.storagePath);
    
        this.watchedGame = Game.restore(null);
    }

    /**
     * Watches over a selected object and saves it every few seconds. The number of seconds is equal to delayBetweenSaves
     */
    public watchForGameChanges(): void {

        setInterval(() => {

            const millisecondsSinceLastSave = new Date().getTime() - this.lastSavedOn().getTime();
            const secondsSinceLastSave = millisecondsSinceLastSave / 1000;

            if (secondsSinceLastSave > this.delayBetweenSaves()) {

                this.saveToLocalStorage();
                this.watchForGameChanges();
            }
        }, 1000);
    }
    
    /**
     * Retrieves the latest saved data from the LocalStorage
     * @returns the latest saved data from the LocalStorage
     */
    private static getDataFromStorage(): ISavablePersistentStorage | null {

        const localStorage = window.localStorage;
        const serializedSave = localStorage.getItem(PersistentStorage.storagePath);
        
        if (serializedSave === null){
            return null;
        }

        let savedPersistentStorage = JSON.parse(serializedSave) as ISavablePersistentStorage;
        
        // Make sure the storage structure is up-to-date before we continue
        savedPersistentStorage = PersistentStorage.migrateStorage(savedPersistentStorage);

        return savedPersistentStorage;
    }
    
    /**
     * Upgrades the saved game to the latest storage format. Returns the migrated data
     * @param persistedStorage - The game data stored in whatever structure it was last saved as
     * @returns the migrated data
     */
    private static migrateStorage(persistedStorage: any): ISavablePersistentStorage {

        // If the root object doesn't have a "game" object, it must have been saved as the format where everything (including the persistence object) is stored under Game
        if (persistedStorage.game === undefined){

            // Example of save as of 24/06/2022 for debugging - {"player":{"bank":{"balance":4257.55},"purchasedStock":{"Electronic Poptarts":{"amount":0,"dividends":3,"valueWhenPurchased":42.49},"Llynx":{"amount":24,"dividends":2,"valueWhenPurchased":41.67},"Facepage":{"amount":38,"dividends":1,"valueWhenPurchased":33.04}}},"moneyGenerator":{"baseCashPerClick":9,"boostExpires":"2022-06-24T14:07:42.000Z"},"persistentStorage":{"delayBetweenSaves":1,"lastSavedOn":"2022-06-24T15:09:04.108Z"},"ticker":{"maxPreviewedCompanies":5,"stockExchange":{"companies":[{"companyName":"Electronic Poptarts","stockYield":3,"stockValue":53.68,"lastUpdated":"2022-06-24T15:09:02.107Z","valueHistory":[54.33,54.99,55.11,54.85,54.11,54.07,54.07,53.96,54.16,54.24,53.68],"isDefault":true},{"companyName":"Toys 'R' We","stockYield":2,"stockValue":35.94,"lastUpdated":"2022-06-24T15:09:02.108Z","valueHistory":[36.53,36.81,36.81,36.81,36.69,36.44,36.5,35.94,35.64,35.33,35.94],"isDefault":true},{"companyName":"Rolléx","stockYield":5,"stockValue":244.8,"lastUpdated":"2022-06-24T15:09:02.110Z","valueHistory":[242.2,242.29,242.29,243.02,242.86,243.52,243.8,244.14,244.89,244.49,244.8],"isDefault":true},{"companyName":"Llynx","stockYield":2,"stockValue":38.65,"lastUpdated":"2022-06-24T15:09:02.116Z","valueHistory":[37.23,37.72,36.98,37.71,37.28,37.09,36.99,37.14,37.89,38.56,38.65],"isDefault":true},{"companyName":"Facepage","stockYield":1,"stockValue":47.18,"lastUpdated":"2022-06-24T15:09:02.124Z","valueHistory":[47.53,47.03,47.03,46.45,46.87,47.52,48,47.63,47.07,47.07,47.18],"isDefault":true},{"companyName":"Intelligence Inside","stockYield":4,"stockValue":219.93,"lastUpdated":"2022-06-24T15:09:02.125Z","valueHistory":[220.94,220.69,220.93,221.07,220.98,220.28,220.07,220.07,219.99,219.99,219.93],"isDefault":true},{"companyName":"AMB Technologies","stockYield":4,"stockValue":76.4,"lastUpdated":"2022-06-24T15:09:02.126Z","valueHistory":[75.79,76.22,76.2,76.69,76.69,76.22,76.1,76.1,76.17,76.31,76.4],"isDefault":true},{"companyName":"Sainsberries","stockYield":3,"stockValue":79.02,"lastUpdated":"2022-06-24T15:09:02.128Z","valueHistory":[77.4,77.05,77.05,77.05,77.05,77.05,77.33,77.79,78.51,79.07,79.02],"isDefault":true},{"companyName":"Cooprative","stockYield":3,"stockValue":52.41,"lastUpdated":"2022-06-24T15:09:02.129Z","valueHistory":[53.57,53.91,54.21,54.21,53.77,53.71,53.95,53.84,53.29,53.02,52.41],"isDefault":true},{"companyName":"Pixelar","stockYield":3,"stockValue":109.11,"lastUpdated":"2022-06-24T15:09:02.130Z","valueHistory":[109.16,109.16,108.59,108.63,108.36,108.69,109.2,108.58,107.94,108.45,109.11],"isDefault":true},{"companyName":"INTEW Holdings","stockYield":5,"stockValue":282.04,"lastUpdated":"2022-06-24T15:08:52.172Z","valueHistory":[283.03,283.3,282.7,282.76,282.06,282.52,282.39,282.35,282.04,282.04,282.04],"isDefault":true}],"selectedCompany":"Llynx"},"tickerInterval":5000},"currentPanel":"ViewStocks"}
            const migratedStorage: ISavablePersistentStorage = {
                game: {
                    moneyGenerator: {
                        baseCashPerClick: persistedStorage.moneyGenerator.baseCashPerClick,
                        boostExpires: persistedStorage.moneyGenerator.boostExpires
                    },
                    currentPanel: persistedStorage.currentPanel,
                    player: {
                        bank: {
                            balance: persistedStorage.player.bank.balance
                        }
                    },
                    ticker: {
                    maxPreviewedCompanies: persistedStorage.ticker.maxPreviewedCompanies,
                    tickerInterval: persistedStorage.ticker.tickerInterval,
                    stockExchange: {
                        // We no longer store default companies. They're in the configuration after all
                        companies: persistedStorage.ticker.stockExchange.companies.filter((company: any) => !company.isDefault),
                        selectedCompany: persistedStorage.ticker.stockExchange.selectedCompany,
                        // This wasn't previously saved
                        stockToBuy: 0,
                        purchasedStock: persistedStorage.player.purchasedStock
                    }
                    }
                },
                delayBetweenSaves: persistedStorage.persistentStorage.delayBetweenSaves,
                lastSavedOn: persistedStorage.persistentStorage.lastSavedOn
            };

            return migratedStorage;
        }

        return persistedStorage;
    }
}

// Keep a reference to the persistentStorage object so we can use it for debugging later
let persistentStorage;

window.addEventListener("load", () => {

    persistentStorage = PersistentStorage.restore();
    persistentStorage.watchForGameChanges();
    
    ko.applyBindings(persistentStorage.watchedGame);
});