// SQR(x) - returns positive square root of x (x >= 0)
export default function sqr(args) {
    if (!args || args.length === 0) {
        throw new Error('SQR requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        throw new Error('SQR: argument must be a number');
    }

    if (x < 0) {
        throw new Error('SQR: argument must be >= 0');
    }

    return Math.sqrt(x);
}
