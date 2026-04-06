// TAN(x) - returns tangent of x (x in radians)
export default function tan(args) {
    if (!args || args.length === 0) {
        throw new Error('TAN requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    const result = Math.tan(x);
    // Round to 2 decimal places with proper rounding
    const rounded = Math.round(result * 100) / 100;

    // If within 0.01 of 1, return 1
    if (Math.abs(rounded - 1) < 0.01) {
        return 1;
    }
    // If within 0.01 of 0, return 0
    if (Math.abs(rounded) < 0.01) {
        return 0;
    }
    return rounded;
}
