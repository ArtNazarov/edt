// VLOOKUP function
export default function vlookup(args, context, rawArgs) {
    if (args.length < 3) {
        throw new Error('VLOOKUP requires at least 3 arguments');
    }

    const lookupValue = args[0];
    const tableArray = args[1];
    const colIndex = args[2];
    const rangeLookup = args.length > 3 ? args[3] : true;

    // Convert colIndex to number
    const colIndexNum = typeof colIndex === 'number' ? colIndex : parseInt(colIndex);
    if (isNaN(colIndexNum) || colIndexNum < 1) {
        throw new Error('Invalid column index number');
    }

    // Handle table array - it could be a range reference that returns an array of arrays
    let tableData = [];

    if (Array.isArray(tableArray)) {
        // If tableArray is a flat array from a range, we need to reshape it
        // For a range like A1:B3, we get a flat array of values
        // We need to group by rows
        const sheet = context.dataHolder.getSheet(context.currentSheet);
        if (rawArgs && rawArgs[1] && rawArgs[1].type === 'RANGE_REF') {
            const rangeNode = rawArgs[1];
            const startColNum = context.columnToNumber(rangeNode.startCol);
            const endColNum = context.columnToNumber(rangeNode.endCol);
            const colsPerRow = endColNum - startColNum + 1;

            // Reshape flat array into rows
            for (let i = 0; i < tableArray.length; i += colsPerRow) {
                tableData.push(tableArray.slice(i, i + colsPerRow));
            }
        } else {
            tableData = tableArray;
        }
    } else if (typeof tableArray === 'string') {
        // Try to parse as range
        const rangeMatch = tableArray.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
        if (rangeMatch) {
            // Need to evaluate the range
            return '#ERROR: Range reference not properly evaluated';
        }
    }

    if (!Array.isArray(tableData) || tableData.length === 0) {
        throw new Error('Invalid table range');
    }

    // Perform lookup
    for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const compareValue = Array.isArray(row) ? row[0] : row;

        let match = false;

        if (rangeLookup === false || rangeLookup === 0 || rangeLookup === 'FALSE') {
            // Exact match
            match = String(compareValue) === String(lookupValue);
            if (match) {
                const result = Array.isArray(row) && row.length >= colIndexNum ? row[colIndexNum - 1] : undefined;
                return result !== undefined ? result : '#N/A';
            }
        } else {
            // Approximate match (requires sorted first column)
            if (String(compareValue) === String(lookupValue)) {
                const result = Array.isArray(row) && row.length >= colIndexNum ? row[colIndexNum - 1] : undefined;
                return result !== undefined ? result : '#N/A';
            }
        }
    }

    return '#N/A';
}
