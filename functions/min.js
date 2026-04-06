// MIN function - returns minimum value
export default function min(args, context, rawArgs) {
    let minVal = Infinity;

    function processValue(val) {
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            if (val < minVal) minVal = val;
        } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num)) {
                if (num < minVal) minVal = num;
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

    return minVal === Infinity ? 0 : minVal;
}
