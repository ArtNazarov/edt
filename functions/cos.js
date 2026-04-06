// COS(x) - returns cosine of x (x in radians)
export default function cos(args) {
    if (!args || args.length === 0) {
        throw new Error('COS requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return Math.cos(x);
}
