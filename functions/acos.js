// ACOS function - returns arccosine of x (quadrants I or II)
export default function acos(args) {
    if (!args || args.length === 0) {
        throw new Error('ACOS requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    // Clamp to valid domain [-1, 1]
    x = Math.max(-1, Math.min(1, x));

    return Math.acos(x);
}
