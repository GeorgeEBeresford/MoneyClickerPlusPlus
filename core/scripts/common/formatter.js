"use strict";
class Formatter {
    static asCurrency(number) {
        // https://stackoverflow.com/a/2901298
        return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
//# sourceMappingURL=formatter.js.map