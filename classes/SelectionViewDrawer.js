// SelectionViewDrawer - Applies CSS styles to selected cells
export default class SelectionViewDrawer {
    constructor() {
        this.injectStyles();
    }

    injectStyles() {
        if (document.querySelector('#selection-styles')) return;

        const style = document.createElement('style');
        style.id = 'selection-styles';
        style.textContent = `
            /* Selection style classes */
            .selected-column {
                background-color: rgba(52, 152, 219, 0.25) !important;
            }
            .selected-row {
                background-color: rgba(231, 76, 60, 0.2) !important;
            }
            .selected-cell {
                background-color: rgba(46, 204, 113, 0.45) !important;
            }
            .selected-range {
                background-color: rgba(155, 89, 182, 0.25) !important;
            }
            .selected-all {
                background-color: rgba(46, 204, 113, 0.25) !important;
            }

            /* Active focus cell indicator */
            .focus-cell {
                outline: 3px solid #4CAF50 !important;
                outline-offset: -1px;
                position: relative;
                z-index: 2;
                background-color: rgba(76, 175, 80, 0.15) !important;
            }

            /* Column header selection style */
            th.selected-column-header {
                background-color: rgba(52, 152, 219, 0.35) !important;
            }

            /* Row header selection style */
            td.selected-row-header {
                background-color: rgba(231, 76, 60, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    render(selectionDataHolder, tableContainer) {
        if (!tableContainer) return;

        // Get current selection from the data holder
        const selection = selectionDataHolder.getCurrent();
        if (!selection) return;

        // Clear all selection classes
        const allCells = tableContainer.querySelectorAll('td, th');
        allCells.forEach(cell => {
            cell.classList.remove('selected-column', 'selected-row', 'selected-cell', 'selected-range', 'selected-all', 'focus-cell', 'selected-column-header', 'selected-row-header');
        });

        // If Select All is active, highlight ALL visible cells in the viewport
        if (selection.selectionAll === true) {
            const dataCells = tableContainer.querySelectorAll('td[contenteditable="true"]');
            dataCells.forEach(cell => cell.classList.add('selected-all'));

            // Also highlight column headers and row headers for visual feedback
            const allDataCells = tableContainer.querySelectorAll('td');
            allDataCells.forEach(cell => cell.classList.add('selected-all'));

            // Highlight focus cell
            const focusCell = tableContainer.querySelector(`td[data-row="${selection.focusRow}"][data-col="${selection.focusCol}"]`);
            if (focusCell) focusCell.classList.add('focus-cell');
            return;
        }

        // Apply column selections
        if (selection.selectedColumns && selection.selectedColumns.size > 0) {
            for (const col of selection.selectedColumns) {
                const dataCells = tableContainer.querySelectorAll(`td[data-col="${col}"]`);
                dataCells.forEach(cell => cell.classList.add('selected-column'));
                const headerCell = tableContainer.querySelector(`th[data-col="${col}"]`);
                if (headerCell) headerCell.classList.add('selected-column-header');
            }
        }

        // Apply row selections
        if (selection.selectedRows && selection.selectedRows.size > 0) {
            for (const row of selection.selectedRows) {
                const rowCells = tableContainer.querySelectorAll(`td[data-row="${row}"]`);
                rowCells.forEach(cell => cell.classList.add('selected-row'));
                const rowHeader = tableContainer.querySelector(`td[data-row="${row}"].row-header-cell`);
                if (rowHeader) rowHeader.classList.add('selected-row-header');
            }
        }

        // Apply individual cells
        if (selection.selectedCellsMap && selection.selectedCellsMap.size > 0) {
            for (const [key] of selection.selectedCellsMap) {
                const [row, col] = key.split(',').map(Number);
                const cell = tableContainer.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
                if (cell) cell.classList.add('selected-cell');
            }
        }

        // Apply ranges
        if (selection.selectedRanges && selection.selectedRanges.length > 0) {
            for (const range of selection.selectedRanges) {
                for (let row = range.startRow; row <= range.endRow; row++) {
                    for (let col = range.startCol; col <= range.endCol; col++) {
                        const cell = tableContainer.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
                        if (cell) cell.classList.add('selected-range');
                    }
                }
            }
        }

        // Apply focus cell
        const focusCell = tableContainer.querySelector(`td[data-row="${selection.focusRow}"][data-col="${selection.focusCol}"]`);
        if (focusCell) focusCell.classList.add('focus-cell');
    }

    // Update just the focus cell without full re-render
    updateFocus(selectionDataHolder, tableContainer) {
        const selection = selectionDataHolder.getCurrent();
        if (!selection) return;

        const focusCells = tableContainer.querySelectorAll('.focus-cell');
        focusCells.forEach(cell => cell.classList.remove('focus-cell'));

        const focusCell = tableContainer.querySelector(`td[data-row="${selection.focusRow}"][data-col="${selection.focusCol}"]`);
        if (focusCell) focusCell.classList.add('focus-cell');
    }
}
