// AVG function implementation
// Calculates the arithmetic mean (average) of all numeric values in a range or list of arguments
export default async function avg(args, context) {
    const values = [];

    for (const arg of args) {
        if (arg.type === 'range') {
            const rangeValues = await context.evaluateRange(arg.start, arg.end);
            values.push(...rangeValues);
        } else if (arg.type === 'expression') {
            const val = await context.evaluate(arg.value);
            if (typeof val === 'number' && !isNaN(val)) {
                values.push(val);
            }
        }
    }

    // Handle empty range
    if (values.length === 0) {
        return 0;
    }

    // Calculate sum and average
    const sum = values.reduce((a, b) => a + b, 0);
    const result = sum / values.length;

    // Format and return
    return context.formatNumber(result);
}
