// COUNT function - counts numeric values
export default function count(args, context, rawArgs) {
    let count = 0;

    function processValue(val) {
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            count++;
        } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num) && val.trim() !== '') {
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

    return count;
}
