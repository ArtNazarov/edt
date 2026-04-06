// AVG function - calculates average of values
export default function avg(args, context, rawArgs) {
    let total = 0;
    let count = 0;

    function processValue(val) {
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            total += val;
            count++;
        } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num) && val.trim() !== '') {
                total += num;
                count++;
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

    return count === 0 ? 0 : total / count;
}
