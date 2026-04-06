// SEC(x) - returns secant of x (1/cos(x))
export default function sec(args) {
    if (!args || args.length === 0) {
        throw new Error('SEC requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    const cosVal = Math.cos(x);
    if (Math.abs(cosVal) < 1e-10) {
        throw new Error('SEC: undefined at π/2 + kπ');
    }

    return 1 / cosVal;
}
