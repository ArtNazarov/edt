// SUMPRODUCT function implementation
// Multiplies corresponding components in the given arrays and returns the sum of those products
export default async function sumproduct(args, context) {
    // SUMPRODUCT requires at least two arguments
    if (args.length < 2) {
        return '#ERROR: SUMPRODUCT requires at least two ranges';
    }

    // Parse each argument into an array of numeric values
    const argValues = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const values = [];

        // Handle evaluated arrays from range references
        if (Array.isArray(arg)) {
            for (const val of arg) {
                if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
                    values.push(val);
                } else if (typeof val === 'string') {
                    const num = parseFloat(val);
                    if (!isNaN(num) && isFinite(num)) {
                        values.push(num);
                    }
                }
            }
        }
        // Handle single numeric values
        else if (typeof arg === 'number' && !isNaN(arg) && isFinite(arg)) {
            values.push(arg);
        }
        // Handle string numbers
        else if (typeof arg === 'string') {
            const num = parseFloat(arg);
            if (!isNaN(num) && isFinite(num)) {
                values.push(num);
            }
        }
        // Handle the case where arg is an object with type 'range' (from raw args)
        else if (arg && typeof arg === 'object' && arg.type === 'RANGE_REF') {
            // This shouldn't happen with the new evaluator, but handle it just in case
            return '#ERROR: SUMPRODUCT arguments must be ranges';
        }
        else {
            return '#ERROR: SUMPRODUCT arguments must be ranges or numbers';
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
            total += (argValues[0][i] || 0) * (argValues[1][i] || 0);
        }
    } else {
        // For more than 2 arguments, multiply across all arguments for each position
        for (let i = 0; i < firstLength; i++) {
            let product = argValues[0][i] || 0;
            for (let j = 1; j < argValues.length; j++) {
                product *= (argValues[j][i] || 0);
            }
            total += product;
        }
    }

    // Return the total (no formatting needed, ASTEvaluator will handle it)
    return total;
}
