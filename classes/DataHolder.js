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
                    {"cell": "F3", "data": "=SUM(first.A2:first.A4)"}
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

    updateCell(sheetName, cellId, data) {
        const sheet = this.sheets[sheetName];
        const existingCell = sheet.cells.find(item => item.cell === cellId);
        if (existingCell) {
            if (data === '') {
                sheet.cells = sheet.cells.filter(item => item.cell !== cellId);
            } else {
                existingCell.data = data;
            }
        } else if (data !== '') {
            sheet.cells.push({ "cell": cellId, "data": data });
        }
    }

    updateViewport(sheetName, start_row, start_col) {
        const sheet = this.sheets[sheetName];
        sheet.start_row = start_row;
        sheet.start_col = start_col;
    }
}
