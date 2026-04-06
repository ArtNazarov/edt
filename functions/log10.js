// LOG10(x) - returns base-10 logarithm of x (x > 0)
export default function log10(args) {
    if (!args || args.length === 0) {
        throw new Error('LOG10 requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        throw new Error('LOG10: argument must be a number');
    }

    if (x <= 0) {
        throw new Error('LOG10: argument must be > 0');
    }

    return Math.log10(x);
}
