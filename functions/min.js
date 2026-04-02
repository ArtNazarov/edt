// MIN function implementation
// Returns the minimum (smallest) numeric value in a range or list of arguments
export default async function min(args, context) {
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

    // Find minimum value
    const result = Math.min(...values);

    // Format and return
    return context.formatNumber(result);
}
