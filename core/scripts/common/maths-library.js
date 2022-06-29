/**
 * A class that provides maths functions for ease of use
 */
export default class MathsLibrary {
    /**
     * Generates a random number between min and max. May also result in max.
     * @param min - The minimum number to generate
     * @param max - The maximum number to generate
     * @returns the generated number
     */
    static getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * Rounds a number to the nearest decimal it can find with the specified precision (e.g. with a precision of 2, 2.442 becomes 2.44 and 2.446 will become 2.45)
     * @param number - The number to round
     * @param precision - The number of decimal places to keep. Must be an integer.
     * @returns the nearest number
     */
    static round(number, precision) {
        var precisionAsPercentage = Math.pow(10, precision);
        var roundedNumber = Math.round(number * precisionAsPercentage) / precisionAsPercentage;
        return roundedNumber;
    }
    /**
     * Rounds a number to the nearest high decimal it can find with the specified precision (e.g. with a precision of 2, 2.442 becomes 2.45)
     * @param number - The number to round
     * @param precision - The number of decimal places to keep. Must be an integer.
     * @returns the nearest high-number
     */
    static ceil(number, precision) {
        var precisionAsPercentage = Math.pow(10, precision);
        var roundedNumber = Math.ceil(number * precisionAsPercentage) / precisionAsPercentage;
        return roundedNumber;
    }
    /**
     * Rounds a number to the nearest low decimal it can find with the specified precision (e.g. with a precision of 2, 2.448 becomes 2.44)
     * @param number - The number to round
     * @param precision - The number of decimal places to keep. Must be an integer.
     * @returns the nearest low-number
     */
    static floor(number, precision) {
        var precisionAsPercentage = Math.pow(10, precision);
        var roundedNumber = Math.floor(number * precisionAsPercentage) / precisionAsPercentage;
        return roundedNumber;
    }
}
//# sourceMappingURL=maths-library.js.map