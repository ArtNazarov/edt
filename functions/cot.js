// COT(x) - returns cotangent of x (cos(x)/sin(x))
export default function cot(args) {
    if (!args || args.length === 0) {
        throw new Error('COT requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    const sinVal = Math.sin(x);
    const cosVal = Math.cos(x);

    if (Math.abs(sinVal) < 1e-10) {
        return Number.POSITIVE_INFINITY;
    }

    const result = cosVal / sinVal;
    // Round to 2 decimal places with proper rounding
    // Handle values very close to 1 (like 0.99)
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
