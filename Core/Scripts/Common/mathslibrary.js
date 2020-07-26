function MathsLibrary() {

}

/**
 * Generates a random number between min and max. May also result in max.
 * @param {Number} min - The minimum number to generate 
 * @param {*} max - The maximum number to generate
 */
MathsLibrary.getRandomNumber = function(min, max){

    return Math.random() * (max - min) + min;
}

/**
 * Rounds a number to the nearest decimal it can find with the specified precision (e.g. with a precision of 2, 2.442 becomes 2.44 and 2.446 will become 2.45)
 * @param {Number} number - The number to round
 * @param {Number} precision - The number of decimal places to keep. Must be an integer.
 */
MathsLibrary.round = function(number, precision) {

    var precisionAsPercentage = Math.pow(10, precision);
    var roundedNumber = Math.round(number * precisionAsPercentage) / precisionAsPercentage;

    return roundedNumber;
}

/**
 * Rounds a number to the nearest high decimal it can find with the specified precision (e.g. with a precision of 2, 2.442 becomes 2.45)
 * @param {Number} number - The number to round
 * @param {Number} precision - The number of decimal places to keep. Must be an integer.
 */
MathsLibrary.ceil = function(number, precision) {

    var precisionAsPercentage = Math.pow(10, precision);
    var roundedNumber = Math.ceil(number * precisionAsPercentage) / precisionAsPercentage;

    return roundedNumber;
}

/**
 * Rounds a number to the nearest low decimal it can find with the specified precision (e.g. with a precision of 2, 2.448 becomes 2.44)
 * @param {Number} number - The number to round
 * @param {Number} precision - The number of decimal places to keep. Must be an integer.
 */
MathsLibrary.floor = function(number, precision) {

    var precisionAsPercentage = Math.pow(10, precision);
    var roundedNumber = Math.floor(number * precisionAsPercentage) / precisionAsPercentage;

    return roundedNumber;
}