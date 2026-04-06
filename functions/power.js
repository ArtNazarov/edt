// POWER(x, y) - Returns a number raised to a power (x^y)
// Supports real numbers (float/decimal) for both base and exponent
// Handles edge cases: zero, negative bases, fractional exponents
// Follows Excel behavior for edge cases

export default function power(args, context, rawArgs) {
    if (!args || args.length < 2) {
        throw new Error('POWER requires 2 arguments (base, exponent)');
    }

    let base = args[0];
    let exponent = args[1];

    // Parse numeric values
    if (typeof base !== 'number' || isNaN(base)) {
        base = parseFloat(base);
        if (isNaN(base)) {
            throw new Error('POWER: base must be a number');
        }
    }

    if (typeof exponent !== 'number' || isNaN(exponent)) {
        exponent = parseFloat(exponent);
        if (isNaN(exponent)) {
            throw new Error('POWER: exponent must be a number');
        }
    }

    // Case 1: Zero base with zero exponent (undefined)
    if (base === 0 && exponent === 0) {
        return '#NUM!';
    }

    // Case 2: Zero base with negative exponent (division by zero)
    // Excel returns #NUM! for 0^(-0.5) but #DIV/0! for 0^(-1)
    // Let's check if exponent is an integer
    if (base === 0 && exponent < 0) {
        // Check if exponent is an integer
        if (Number.isInteger(exponent)) {
            return '#DIV/0!';
        } else {
            // Fractional negative exponent - Excel returns #NUM!
            return '#NUM!';
        }
    }

    // Case 3: Zero base with positive exponent
    if (base === 0 && exponent > 0) {
        return 0;
    }

    // Case 4: Negative base with fractional exponent (non-integer)
    if (base < 0 && !Number.isInteger(exponent)) {
        // Check if exponent is effectively an integer (within floating point tolerance)
        const nearestInt = Math.round(exponent);
        if (Math.abs(exponent - nearestInt) > 1e-10) {
            return '#NUM!';
        }
        // Use integer exponent for calculation
        exponent = nearestInt;
    }

    // Calculate the power
    try {
        // Handle negative base with integer exponent using Math.pow
        // Math.pow handles negative base with integer exponent correctly
        const result = Math.pow(base, exponent);

        // Check for overflow or invalid results
        if (!isFinite(result)) {
            if (result === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
            if (result === Number.NEGATIVE_INFINITY) return Number.NEGATIVE_INFINITY;
            return '#NUM!';
        }

        // Handle potential floating point precision issues
        if (isNaN(result)) {
            return '#NUM!';
        }

        return result;
    } catch (error) {
        return '#NUM!';
    }
}
