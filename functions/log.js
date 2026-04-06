// LOG(x) - returns natural logarithm of x (x > 0)
export default function log(args) {
    if (!args || args.length === 0) {
        throw new Error('LOG requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        throw new Error('LOG: argument must be a number');
    }

    if (x <= 0) {
        throw new Error('LOG: argument must be > 0');
    }

    return Math.log(x);
}
