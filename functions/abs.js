// ABS function - returns absolute value of x
export default function abs(args) {
    if (!args || args.length === 0) {
        throw new Error('ABS requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    return Math.abs(x);
}
