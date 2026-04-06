// CEIL(x) - returns smallest integer >= x
export default function ceil(args) {
    if (!args || args.length === 0) {
        throw new Error('CEIL requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return Math.ceil(x);
}
