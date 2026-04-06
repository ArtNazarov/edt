// MAX function - returns maximum value
export default function max(args, context, rawArgs) {
    let maxVal = -Infinity;

    function processValue(val) {
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            if (val > maxVal) maxVal = val;
        } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num)) {
                if (num > maxVal) maxVal = num;
            }
        }
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (Array.isArray(arg)) {
            for (const val of arg) {
                processValue(val);
            }
        } else {
            processValue(arg);
        }
    }

    return maxVal === -Infinity ? 0 : maxVal;
}
