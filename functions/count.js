// COUNT function implementation
// Counts the number of numeric values in a range or list of arguments
export default async function count(args, context) {
    let count = 0;

    for (const arg of args) {
        if (arg.type === 'range') {
            const rangeValues = await context.evaluateRange(arg.start, arg.end);
            // rangeValues already contains only numeric values from evaluateRange
            count += rangeValues.length;
        } else if (arg.type === 'expression') {
            const val = await context.evaluate(arg.value);
            if (typeof val === 'number' && !isNaN(val)) {
                count++;
            }
        }
    }

    // Return the count (no formatting needed as it's always an integer)
    return count;
}
