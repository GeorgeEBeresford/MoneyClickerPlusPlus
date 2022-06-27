class Formatter {

    public static asCurrency(number: number): string {

        // https://stackoverflow.com/a/2901298
        return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}