/**
 * Represents a PersistentStorage that has been saved as JSON
 */
export default interface ISavablePersistentStorage {

    game: Interfaces.ISavableGame,
    lastSavedOn: string;
    delayBetweenSaves: number;
}