// SheetView - Renders the current viewport as an HTML table
export default class SheetView {
    constructor(containerId, viewModel, onCellEdit, appController) {
        this.container = document.getElementById(containerId);
        this.viewModel = viewModel;
        this.onCellEdit = onCellEdit;
        this.appController = appController;
        this.contextMenu = null;
        this.handleBlur = null;
        this.handleDoubleClick = null;
        this.handleContextMenu = null;
    }

    getColumnLetter(colIndex) {
        let letter = '';
        let index = colIndex;
        while (index > 0) {
            index--;
            letter = String.fromCharCode(65 + (index % 26)) + letter;
            index = Math.floor(index / 26);
        }
        return letter;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async render() {
        try {
            const start_row = this.viewModel.getStartRow();
            const start_col = this.viewModel.getStartCol();
            const end_row = this.viewModel.getEndRow();
            const end_col = this.viewModel.getEndCol();
            const cells = this.viewModel.getCells();
            const showFormulas = this.viewModel.showFormulas;

            console.log('SheetView.render - Viewport:', { start_row, start_col, end_row, end_col });
            console.log('SheetView.render - Cells count:', cells.length);

            // Validate viewport range
            if (start_row > end_row || start_col > end_col) {
                console.error('Invalid viewport range:', { start_row, end_row, start_col, end_col });
                this.container.innerHTML = '<div style="color: red; padding: 20px;">Invalid viewport range. Please reset the view.</div>';
                return;
            }

            let table = '<table><thead><tr><th class="row-header-cell">Row</th>';
            for (let col = start_col; col <= end_col; col++) {
                table += `<th data-col="${col}">${this.getColumnLetter(col)}</th>`;
            }
            table += '</tr></thead><tbody>';

            for (let row = start_row; row <= end_row; row++) {
                table += `<tr data-row="${row}">`;
                table += `<td class="row-header-cell" data-row="${row}">${row}</td>`;
                for (let col = start_col; col <= end_col; col++) {
                    const cellId = this.getColumnLetter(col) + row;
                    const cellData = cells.find(item => item.cell === cellId);
                    let displayValue = '';

                    try {
                        displayValue = await this.viewModel.getDisplayValue(cellData);
                    } catch (err) {
                        console.error('Error getting display value for', cellId, err);
                        displayValue = '#ERROR';
                    }

                    const isFormula = cellData && cellData.data && cellData.data.toString().startsWith('=');
                    const cellClass = (showFormulas && isFormula) ? 'cell-formula' : '';
                    const hasError = !showFormulas && displayValue && displayValue.toString().startsWith('#ERROR');
                    const errorClass = hasError ? 'cell-error' : '';

                    // Add tip indicator class if cell has a tip
                    const hasTip = cellData && cellData.metadata && cellData.metadata.tip;
                    const tipClass = hasTip ? 'cell-has-tip' : '';

                    const displayStr = displayValue !== undefined && displayValue !== null ? String(displayValue) : '';

                    // Note: contenteditable is false by default - editing only on double-click
                    table += `<td data-cell="${cellId}"
                        data-row="${row}"
                        data-col="${col}"
                        class="${cellClass} ${errorClass} ${tipClass}">${this.escapeHtml(displayStr)}</td>`;
                }
                table += '</tr>';
            }
            table += '</tbody><table>';

            console.log('SheetView.render - Table HTML length:', table.length);
            this.container.innerHTML = table;
            this.attachEditListeners();
            this.attachContextMenuListeners();
            this.attachSelectionListeners();

        } catch (error) {
            console.error('SheetView.render error:', error);
            this.container.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
        }
    }

    attachEditListeners() {
        const cells = this.container.querySelectorAll('td[data-cell]');
        console.log('Attaching edit listeners to', cells.length, 'cells');

        cells.forEach(cell => {
            // Remove existing listener to avoid duplicates
            cell.removeEventListener('dblclick', this.handleDoubleClick);

            // Create new double-click handler for editing
            this.handleDoubleClick = async (event) => {
                event.preventDefault();
                event.stopPropagation();

                const cellElement = event.currentTarget;
                const cellId = cellElement.getAttribute('data-cell');
                const currentValue = cellElement.textContent;

                // Make cell editable
                cellElement.contentEditable = 'true';
                cellElement.focus();

                // Select all text in the cell
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(cellElement);
                selection.removeAllRanges();
                selection.addRange(range);

                // Handle blur to save changes
                const onBlur = async () => {
                    const newValue = cellElement.textContent;
                    cellElement.contentEditable = 'false';
                    cellElement.removeEventListener('blur', onBlur);

                    if (newValue !== currentValue && this.onCellEdit) {
                        await this.onCellEdit(cellId, newValue);
                    }
                };

                cellElement.addEventListener('blur', onBlur, { once: true });
            };

            cell.addEventListener('dblclick', this.handleDoubleClick);
        });
    }

    attachSelectionListeners() {
        const cells = this.container.querySelectorAll('td[data-cell]');
        console.log('Attaching selection listeners to', cells.length, 'cells');

        cells.forEach(cell => {
            // Remove existing listener to avoid duplicates
            cell.removeEventListener('click', this.handleCellClick);

            // Create new click handler for selection only (not editing)
            this.handleCellClick = (event) => {
                // Don't trigger if we're in edit mode
                if (cell.contentEditable === 'true') return;

                const row = parseInt(cell.getAttribute('data-row'));
                const col = parseInt(cell.getAttribute('data-col'));

                if (isNaN(row) || isNaN(col)) return;

                // Handle selection based on modifier keys
                if (event.ctrlKey || event.metaKey) {
                    // Ctrl+Click: Toggle cell selection
                    this.appController.selectionManager?.toggleCell(row, col);
                } else if (event.shiftKey) {
                    // Shift+Click: Range selection from focus to clicked cell
                    const focus = this.appController.selectionManager?.data.getFocus();
                    if (focus) {
                        this.appController.selectionManager?.data.setRange(focus.row, focus.col, row, col);
                        this.appController.selectionManager?.render();
                        this.appController.selectionManager?.notifySelectionChange();
                    }
                } else {
                    // Normal click: Set focus and clear other selections
                    if (this.appController.selectionManager) {
                        // Clear range selections
                        if (this.appController.selectionManager.data.getSelectedRanges().length > 0) {
                            this.appController.selectionManager.data.clearRanges();
                        }
                        if (this.appController.selectionManager.data.isSelectionAll()) {
                            this.appController.selectionManager.data.setSelectionAll(false);
                        }
                        this.appController.selectionManager.data.clearRangeAnchor();
                        this.appController.selectionManager.data.setFocus(row, col);
                        this.appController.selectionManager.render();
                        this.appController.selectionManager.notifySelectionChange();
                    }
                }
            };

            cell.addEventListener('click', this.handleCellClick);
        });
    }

    attachContextMenuListeners() {
        const cells = this.container.querySelectorAll('td[data-cell]');
        console.log('Attaching context menu listeners to', cells.length, 'cells');

        cells.forEach(cell => {
            // Remove existing listener to avoid duplicates
            cell.removeEventListener('contextmenu', this.handleContextMenu);

            // Create new context menu handler
            this.handleContextMenu = (event) => {
                event.preventDefault();
                event.stopPropagation();

                const cellId = event.currentTarget.getAttribute('data-cell');
                const x = event.pageX;
                const y = event.pageY;

                // Try to use appController first, then fallback to window.app
                if (this.appController && this.appController.handleContextMenu) {
                    this.appController.handleContextMenu(event, cellId);
                } else if (window.app && window.app.handleContextMenu) {
                    window.app.handleContextMenu(event, cellId);
                } else {
                    console.warn('AppController or handleContextMenu not available');
                    alert(`Context menu for cell: ${cellId}\nCoordinates: (${x}, ${y})\nAppController not available.`);
                }
            };

            cell.addEventListener('contextmenu', this.handleContextMenu);
        });
    }

    // Method to refresh context menu listeners without re-rendering
    refreshContextMenuListeners() {
        this.attachContextMenuListeners();
    }

    // Method to refresh edit listeners without re-rendering
    refreshEditListeners() {
        this.attachEditListeners();
    }

    // Method to refresh selection listeners without re-rendering
    refreshSelectionListeners() {
        this.attachSelectionListeners();
    }

    // Method to get the table container element
    getTableContainer() {
        return this.container;
    }

    // Method to get all data cells
    getDataCells() {
        return this.container.querySelectorAll('td[data-cell]');
    }

    // Method to get column headers
    getColumnHeaders() {
        return this.container.querySelectorAll('thead th');
    }

    // Method to get row headers
    getRowHeaders() {
        return this.container.querySelectorAll('tbody .row-header-cell');
    }

    // Method to get cell by coordinates
    getCellByCoordinates(row, col) {
        return this.container.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    }

    // Method to focus a specific cell (visual only, not edit mode)
    focusCell(row, col) {
        const cell = this.getCellByCoordinates(row, col);
        if (cell) {
            cell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}
