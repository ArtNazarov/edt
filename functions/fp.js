// FP(x) - returns fractional part of x
export default function fp(args) {
    if (!args || args.length === 0) {
        throw new Error('FP requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return x - Math.floor(x);
}
