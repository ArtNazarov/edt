// SUM function implementation
export default async function sum(args, context) {
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

    const result = values.reduce((a, b) => a + b, 0);
    return context.formatNumber(result);
}
