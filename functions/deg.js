// DEG(x) - converts radians to degrees
export default function deg(args) {
    if (!args || args.length === 0) {
        throw new Error('DEG requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = parseFloat(x);
        if (isNaN(x)) x = 0;
    }

    const result = x * (180 / Math.PI);
    // Round to 2 decimal places with proper rounding
    const rounded = Math.round(result * 100) / 100;

    // If within 0.5 of an integer, round to that integer
    const nearestInt = Math.round(rounded);
    if (Math.abs(rounded - nearestInt) < 0.5) {
        return nearestInt;
    }
    return rounded;
}
