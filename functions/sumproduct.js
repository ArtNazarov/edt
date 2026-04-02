// SUMPRODUCT function implementation
// Multiplies corresponding components in the given arrays and returns the sum of those products
export default async function sumproduct(args, context) {
    // SUMPRODUCT requires at least two arguments
    if (args.length < 2) {
        return '#ERROR: SUMPRODUCT requires at least two ranges';
    }

    // Parse each argument into an array of numeric values
    const argValues = [];

    for (const arg of args) {
        const values = [];

        if (arg.type === 'range') {
            const rangeValues = await context.evaluateRange(arg.start, arg.end);
            values.push(...rangeValues);
        } else if (arg.type === 'expression') {
            const val = await context.evaluate(arg.value);
            if (typeof val === 'number' && !isNaN(val)) {
                values.push(val);
            }
        } else {
            return '#ERROR: SUMPRODUCT arguments must be ranges';
        }

        argValues.push(values);
    }

    // Check that all arguments have the same length
    const firstLength = argValues[0].length;
    for (let i = 1; i < argValues.length; i++) {
        if (argValues[i].length !== firstLength) {
            return '#ERROR: SUMPRODUCT ranges must have the same size';
        }
    }

    // If no values, return 0
    if (firstLength === 0) {
        return 0;
    }

    // Calculate the sum of products
    let total = 0;

    if (argValues.length === 2) {
        // Standard case: two ranges multiplied element-wise
        for (let i = 0; i < firstLength; i++) {
            total += argValues[0][i] * argValues[1][i];
        }
    } else {
        // For more than 2 arguments, multiply across all arguments for each position
        // Example: =SUMPRODUCT(A1:A3, B1:B3, C1:C3)
        // = (A1*B1*C1) + (A2*B2*C2) + (A3*B3*C3)
        for (let i = 0; i < firstLength; i++) {
            let product = argValues[0][i];
            for (let j = 1; j < argValues.length; j++) {
                product *= argValues[j][i];
            }
            total += product;
        }
    }

    // Format and return (round to 2 decimal places)
    return context.formatNumber(total);
}
