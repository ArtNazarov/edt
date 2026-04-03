// ExportCSVAction - Handles exporting spreadsheet data to CSV format
export default class ExportCSVAction {
    constructor(appController) {
        this.appController = appController;
    }

    async execute() {
        try {
            const currentSheet = this.appController.dataHolder.currentSheet;
            const sheet = this.appController.dataHolder.getCurrentSheet();
            const cells = sheet.cells;

            // Build a map of cell values
            const cellMap = new Map();
            for (const cell of cells) {
                cellMap.set(cell.cell, cell.data);
            }

            // Determine the range of cells to export
            const { minRow, maxRow, minCol, maxCol } = this.getCellRange(cells);

            // Generate CSV content
            const csvRows = [];

            // Add header row with column letters
            const headers = ['Row'];
            for (let col = minCol; col <= maxCol; col++) {
                headers.push(this.numberToColumn(col));
            }
            csvRows.push(this.escapeCSV(headers));

            // Add data rows
            for (let row = minRow; row <= maxRow; row++) {
                const rowData = [row.toString()];
                for (let col = minCol; col <= maxCol; col++) {
                    const cellRef = this.numberToColumn(col) + row;
                    let cellValue = cellMap.get(cellRef) || '';

                    // If it's a formula, get the computed value or formula based on mode
                    if (cellValue && cellValue.toString().startsWith('=')) {
                        const cellObj = sheet.cells.find(c => c.cell === cellRef);
                        if (cellObj && this.appController.showFormulas) {
                            // Keep formula
                            cellValue = cellObj.data;
                        } else if (cellObj) {
                            // Get computed value - await here is fine because execute is async
                            const computedValue = await this.appController.computationEngine.computeCellValue(currentSheet, cellObj);
                            cellValue = computedValue;
                        }
                    }

                    rowData.push(cellValue);
                }
                csvRows.push(this.escapeCSV(rowData));
            }

            const csvContent = csvRows.join('\n');

            // Add UTF-8 BOM for proper Unicode support
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Generate filename
            const timestamp = this.getTimestamp();
            const filename = `${currentSheet}_${timestamp}.csv`;

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            this.showMessage(`Successfully exported to: ${filename}`, 'success');
            return true;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            this.showMessage(`Error exporting to CSV: ${error.message}`, 'error');
            return false;
        }
    }

    getCellRange(cells) {
        let minRow = Infinity;
        let maxRow = -Infinity;
        let minCol = Infinity;
        let maxCol = -Infinity;

        for (const cell of cells) {
            const colMatch = cell.cell.match(/[A-Z]+/);
            const rowMatch = cell.cell.match(/[0-9]+/);

            if (colMatch && rowMatch) {
                const col = this.columnToNumber(colMatch[0]);
                const row = parseInt(rowMatch[0]);

                minRow = Math.min(minRow, row);
                maxRow = Math.max(maxRow, row);
                minCol = Math.min(minCol, col);
                maxCol = Math.max(maxCol, col);
            }
        }

        // If no cells found, return default range
        if (minRow === Infinity) {
            return { minRow: 1, maxRow: 10, minCol: 1, maxCol: 5 };
        }

        // Add some padding
        minRow = Math.max(1, minRow - 1);
        maxRow = maxRow + 1;
        minCol = Math.max(1, minCol - 1);
        maxCol = maxCol + 1;

        return { minRow, maxRow, minCol, maxCol };
    }

    escapeCSV(rowData) {
        return rowData.map(cell => {
            if (cell === undefined || cell === null) return '';
            const stringCell = String(cell);
            // Check if cell needs quoting (contains comma, quote, or newline)
            if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
                return '"' + stringCell.replace(/"/g, '""') + '"';
            }
            return stringCell;
        }).join(',');
    }

    columnToNumber(col) {
        let result = 0;
        for (let i = 0; i < col.length; i++) {
            result = result * 26 + (col.charCodeAt(i) - 64);
        }
        return result;
    }

    numberToColumn(num) {
        let result = '';
        let index = num;
        while (index > 0) {
            index--;
            result = String.fromCharCode(65 + (index % 26)) + result;
            index = Math.floor(index / 26);
        }
        return result;
    }

    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `action-message action-${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        // Add animation styles if not present
        if (!document.querySelector('#action-message-styles')) {
            const style = document.createElement('style');
            style.id = 'action-message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(msgDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (msgDiv.parentNode) {
                    msgDiv.parentNode.removeChild(msgDiv);
                }
            }, 300);
        }, 3000);
    }
}
