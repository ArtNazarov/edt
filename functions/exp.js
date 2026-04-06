// EXP(x) - returns e raised to the power x
export default function exp(args) {
    if (!args || args.length === 0) {
        throw new Error('EXP requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return Math.exp(x);
}
