// ATN(x) - returns arctangent of x (quadrants I or IV)
export default function atn(args) {
    if (!args || args.length === 0) {
        throw new Error('ATN requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    return Math.atan(x);
}
