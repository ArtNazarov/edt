// SIN(x) - returns sine of x (x in radians)
export default function sin(args) {
    if (!args || args.length === 0) {
        throw new Error('SIN requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return Math.sin(x);
}
