// VLOOKUP function implementation
// Looks up a value in the first column of a table and returns a value in the same row from a specified column
export default async function vlookup(args, context) {
    // VLOOKUP requires at least 3 arguments: lookup_value, table_array, col_index_num
    // Optional 4th argument: range_lookup (TRUE/FALSE, default TRUE)
    if (args.length < 3) {
        return '#ERROR: VLOOKUP requires at least 3 arguments (lookup_value, table_array, col_index_num)';
    }

    // Extract and evaluate arguments
    let lookupValue = await context.evaluate(args[0].value);
    let tableArray = args[1];
    let colIndexNum = await context.evaluate(args[2].value);
    let rangeLookup = true; // Default to approximate match (TRUE)

    // Check for optional range_lookup argument
    if (args.length >= 4) {
        const rangeLookupValue = await context.evaluate(args[3].value);
        if (typeof rangeLookupValue === 'boolean') {
            rangeLookup = rangeLookupValue;
        } else if (typeof rangeLookupValue === 'string') {
            rangeLookup = rangeLookupValue.toUpperCase() !== 'FALSE';
        } else {
            rangeLookup = !!rangeLookupValue;
        }
    }

    // Validate col_index_num
    if (typeof colIndexNum !== 'number' || isNaN(colIndexNum) || colIndexNum < 1) {
        return '#ERROR: Invalid column index number';
    }

    // Get the table range as a 2D array
    let tableData = [];

    if (tableArray.type === 'range') {
        // Parse the range
        const startRef = tableArray.start.value;
        const endRef = tableArray.end.value;

        let sheetPrefix = '';
        let startCell = startRef;
        let endCell = endRef;

        // Handle cross-sheet references
        const startMatch = startRef.match(/^([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)$/);
        if (startMatch) {
            sheetPrefix = startMatch[1] + '.';
            startCell = startMatch[2];
        }

        const endMatch = endRef.match(/^([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)$/);
        if (endMatch) {
            endCell = endMatch[2];
        }

        // Parse cell references
        const startColMatch = startCell.match(/[A-Z]+/);
        const startRowMatch = startCell.match(/[0-9]+/);
        const endColMatch = endCell.match(/[A-Z]+/);
        const endRowMatch = endCell.match(/[0-9]+/);

        if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
            return '#ERROR: Invalid table range';
        }

        const startCol = context.columnToNumber(startColMatch[0]);
        const startRow = parseInt(startRowMatch[0]);
        const endCol = context.columnToNumber(endColMatch[0]);
        const endRow = parseInt(endRowMatch[0]);

        // Build the 2D table array
        for (let row = startRow; row <= endRow; row++) {
            const rowData = [];
            for (let col = startCol; col <= endCol; col++) {
                const cellRef = context.numberToColumn(col) + row;
                const fullRef = sheetPrefix ? sheetPrefix + cellRef : cellRef;
                const cellValue = await context.evaluateCellReference(fullRef);
                rowData.push(cellValue);
            }
            tableData.push(rowData);
        }
    } else {
        return '#ERROR: VLOOKUP table_array must be a range';
    }

    // Validate column index
    if (colIndexNum > tableData[0].length) {
        return '#ERROR: Column index exceeds table width';
    }

    // Perform the lookup
    let matchedRow = null;
    let matchedIndex = -1;

    if (rangeLookup) {
        // Approximate match (TRUE) - assumes first column is sorted ascending
        // Returns the largest value less than or equal to lookup_value
        for (let i = 0; i < tableData.length; i++) {
            const cellValue = tableData[i][0];

            // Convert to number for comparison if possible
            let compareValue = cellValue;
            let compareLookup = lookupValue;

            if (typeof cellValue === 'number' && typeof lookupValue === 'number') {
                compareValue = cellValue;
                compareLookup = lookupValue;
            } else if (typeof cellValue === 'string' && typeof lookupValue === 'string') {
                compareValue = cellValue.toLowerCase();
                compareLookup = lookupValue.toLowerCase();
            }

            if (compareValue <= compareLookup) {
                matchedRow = tableData[i];
                matchedIndex = i;
            } else {
                break; // Since sorted, we can stop once value exceeds lookup
            }
        }

        // If no match found and we have at least one row, use the first row
        if (matchedIndex === -1 && tableData.length > 0) {
            matchedRow = tableData[0];
            matchedIndex = 0;
        }
    } else {
        // Exact match (FALSE)
        for (let i = 0; i < tableData.length; i++) {
            const cellValue = tableData[i][0];

            // Compare values
            let isMatch = false;

            if (typeof cellValue === 'number' && typeof lookupValue === 'number') {
                isMatch = cellValue === lookupValue;
            } else if (typeof cellValue === 'string' && typeof lookupValue === 'string') {
                isMatch = cellValue.toLowerCase() === lookupValue.toLowerCase();
            } else {
                isMatch = cellValue == lookupValue;
            }

            if (isMatch) {
                matchedRow = tableData[i];
                matchedIndex = i;
                break;
            }
        }

        // If no exact match found, return #N/A error
        if (matchedIndex === -1) {
            return '#N/A';
        }
    }

    // Return the value from the specified column (1-indexed)
    if (matchedRow && colIndexNum <= matchedRow.length) {
        const result = matchedRow[colIndexNum - 1];

        // Format numbers
        if (typeof result === 'number' && !isNaN(result)) {
            return context.formatNumber(result);
        }

        return result !== undefined && result !== null ? result : '';
    }

    return '#N/A';
}
