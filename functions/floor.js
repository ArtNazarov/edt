// FLOOR(x) / INT(x) - returns largest integer <= x
export default function floor(args) {
    if (!args || args.length === 0) {
        throw new Error('FLOOR/INT requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return Math.floor(x);
}
