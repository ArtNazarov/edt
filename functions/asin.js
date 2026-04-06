// ASIN function - returns arcsine of x (quadrants I or IV)
// Domain: x in [-1, 1]
export default function asin(args) {
    if (!args || args.length === 0) {
        throw new Error('ASIN requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    // Clamp to valid domain [-1, 1]
    x = Math.max(-1, Math.min(1, x));

    return Math.asin(x);
}
