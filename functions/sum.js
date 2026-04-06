// SUM function - calculates sum of values
export default function sum(args, context, rawArgs) {
    let total = 0;

    function processValue(val) {
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            total += val;
        } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num)) {
                total += num;
            }
        }
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (Array.isArray(arg)) {
            // Handle array from range reference
            for (const val of arg) {
                processValue(val);
            }
        } else if (arg && typeof arg === 'object' && arg.type === 'RANGE_REF') {
            // This shouldn't happen as ranges should be evaluated before
            console.warn('Unprocessed range reference in SUM');
        } else {
            // Handle single value (number, string, or evaluated cell reference)
            processValue(arg);
        }
    }

    return total;
}
