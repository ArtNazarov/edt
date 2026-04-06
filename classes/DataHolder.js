// Data Holder - Stores all sheet data
export default class DataHolder {
    constructor() {
        this.sheets = {
            "first": {
                start_row: 1,
                start_col: 1,
                cells: [
                    {"cell": "A1", "data": "Some data"},
                    {"cell": "A2", "data": "10"},
                    {"cell": "A3", "data": "20"},
                    {"cell": "A4", "data": "30.5"},
                    {"cell": "B2", "data": "30"},
                    {"cell": "B3", "data": "40"},
                    {"cell": "B4", "data": "50.75"},
                    {"cell": "C2", "data": "=SUM(A2:B4)"},
                    {"cell": "C3", "data": "=AVG(A2:B4)"},
                    {"cell": "C4", "data": "=MAX(A2:B4)"},
                    {"cell": "D2", "data": "=MIN(A2:B4)"},
                    {"cell": "D3", "data": "=COUNT(A2:B4)"},
                    {"cell": "E2", "data": "=A2 + B2"},
                    {"cell": "E3", "data": "=AVG(A2:A4)"}
                ]
            },
            "second": {
                start_row: 3,
                start_col: 2,
                cells: [
                    {"cell": "B3", "data": "other"},
                    {"cell": "C3", "data": "100"},
                    {"cell": "D3", "data": "200"},
                    {"cell": "E3", "data": "=first.C2 + 50"},
                    {"cell": "F3", "data": "=SUM(first.A2:A4)"}
                ]
            },
            "sumproduct": {
                start_row: 1,
                start_col: 1,
                cells: [
                    {"cell": "A1", "data": "2"},
                    {"cell": "A2", "data": "3"},
                    {"cell": "B1", "data": "4"},
                    {"cell": "B2", "data": "5"},
                    {"cell": "C1", "data": "6"},
                    {"cell": "C2", "data": "7"},
                    {"cell": "E2", "data": "=SUMPRODUCT(A1:A2, B1:B2, C1:C2)"}
                ]
            },
            "vlookup": {
                start_row: 1,
                start_col: 1,
                cells: [
                    {"cell": "A1", "data": "Product A"},
                    {"cell": "B1", "data": "100"},
                    {"cell": "A2", "data": "Product B"},
                    {"cell": "B2", "data": "200"},
                    {"cell": "A3", "data": "Product C"},
                    {"cell": "B3", "data": "300"},
                    {"cell": "D1", "data": "Product B"},
                    {"cell": "E1", "data": "=VLOOKUP(D1, A1:B3, 2, FALSE)"}
                ]
            }
        };
        this.currentSheet = 'first';
    }

    getCurrentSheet() {
        return this.sheets[this.currentSheet];
    }

    getSheet(name) {
        return this.sheets[name];
    }

    setCurrentSheet(name) {
        if (this.sheets[name]) {
            this.currentSheet = name;
        }
    }

    getSheetNames() {
        return Object.keys(this.sheets);
    }

    // Check if a sheet exists
    hasSheet(sheetName) {
        return this.sheets.hasOwnProperty(sheetName);
    }

    // Add a new sheet
    addSheet(sheetName) {
        if (!this.sheets[sheetName]) {
            this.sheets[sheetName] = {
                start_row: 1,
                start_col: 1,
                cells: []
            };
            return true;
        }
        return false;
    }

    // Remove a sheet
    removeSheet(sheetName) {
        if (this.sheets[sheetName] && sheetName !== 'first') {
            delete this.sheets[sheetName];
            if (this.currentSheet === sheetName) {
                this.currentSheet = 'first';
            }
            return true;
        }
        return false;
    }

    // Get all sheets
    getAllSheets() {
        return this.sheets;
    }

    // Get cell value
    getCellValue(sheetName, cellId) {
        const sheet = this.sheets[sheetName];
        if (!sheet) return '';

        const cell = sheet.cells.find(item => item.cell === cellId);
        return cell ? cell.data : '';
    }

    // Set cell value
    setCellValue(sheetName, cellId, data) {
        const sheet = this.sheets[sheetName];
        if (!sheet) {
            // Create sheet if it doesn't exist
            this.addSheet(sheetName);
            return this.setCellValue(sheetName, cellId, data);
        }

        const existingCell = sheet.cells.find(item => item.cell === cellId);
        if (existingCell) {
            if (data === '' || data === null || data === undefined) {
                // Remove cell if empty
                sheet.cells = sheet.cells.filter(item => item.cell !== cellId);
            } else {
                existingCell.data = String(data);
            }
        } else if (data !== '' && data !== null && data !== undefined) {
            sheet.cells.push({ "cell": cellId, "data": String(data) });
        }
    }

    updateCell(sheetName, cellId, data) {
        this.setCellValue(sheetName, cellId, data);
    }

    updateViewport(sheetName, start_row, start_col) {
        const sheet = this.sheets[sheetName];
        if (!sheet) return;

        // Ensure start_row and start_col are within valid ranges
        const MAX_ROW = 999;
        const MAX_COL = 18278;
        const VIEWPORT_HEIGHT = 7;
        const VIEWPORT_WIDTH = 7;

        // Clamp values
        let validStartRow = Math.max(1, Math.min(start_row, MAX_ROW - VIEWPORT_HEIGHT + 1));
        let validStartCol = Math.max(1, Math.min(start_col, MAX_COL - VIEWPORT_WIDTH + 1));

        sheet.start_row = validStartRow;
        sheet.start_col = validStartCol;
    }

    // Get viewport start row
    getViewportStartRow(sheetName) {
        const sheet = this.sheets[sheetName];
        return sheet ? sheet.start_row : 1;
    }

    // Get viewport start column
    getViewportStartCol(sheetName) {
        const sheet = this.sheets[sheetName];
        return sheet ? sheet.start_col : 1;
    }

    // Get all cells in a sheet
    getAllCells(sheetName) {
        const sheet = this.sheets[sheetName];
        return sheet ? sheet.cells : [];
    }

    // Clear all cells in a sheet
    clearSheet(sheetName) {
        const sheet = this.sheets[sheetName];
        if (sheet) {
            sheet.cells = [];
        }
    }

    // In DataHolder.js, add these helper methods:
    colNameToColNumber(colName) {
        let result = 0;
        for (let i = 0; i < colName.length; i++) {
            result = result * 26 + (colName.charCodeAt(i) - 64);
        }
        return result;
    }

    colNumberToColName(colNum) {
        let result = '';
        let num = colNum;
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }

    // Parse cell address to row and column numbers
    parseCellAddress(cellAddress) {
        const match = cellAddress.match(/([A-Z]+)(\d+)/);
        if (!match) {
            throw new Error(`Invalid cell address: ${cellAddress}`);
        }
        const colName = match[1];
        const rowNum = parseInt(match[2], 10);
        const colNum = this.colNameToColNumber(colName);
        return { row: rowNum, col: colNum, colName, rowNum };
    }

    // Convert row and column numbers to cell address
    getCellAddress(row, col) {
        const colName = this.colNumberToColName(col);
        return `${colName}${row}`;
    }
}
