// SGN(x) - returns sign of x: -1 if x < 0, 0 if x == 0, 1 if x > 0
export default function sgn(args) {
    if (!args || args.length === 0) {
        throw new Error('SGN requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        return 0;
    }

    if (x < 0) return -1;
    if (x > 0) return 1;
    return 0;
}
