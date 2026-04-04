// SheetView - Renders the current viewport as an HTML table
export default class SheetView {
    constructor(containerId, viewModel, onCellEdit, appController) {
        this.container = document.getElementById(containerId);
        this.viewModel = viewModel;
        this.onCellEdit = onCellEdit;
        this.appController = appController;
        this.contextMenu = null;
        this.handleBlur = null;
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
        const start_row = this.viewModel.getStartRow();
        const start_col = this.viewModel.getStartCol();
        const end_row = this.viewModel.getEndRow();
        const end_col = this.viewModel.getEndCol();
        const cells = this.viewModel.getCells();
        const showFormulas = this.viewModel.showFormulas;

        let table = '<table><thead>;<th>Row</th>';
        for (let col = start_col; col <= end_col; col++) {
            table += `<th>${this.getColumnLetter(col)}</th>`;
        }
        table += '</thead><tbody>';

        for (let row = start_row; row <= end_row; row++) {
            table += `<tr><td contenteditable="false">${row}</td>`;
            for (let col = start_col; col <= end_col; col++) {
                const cellId = this.getColumnLetter(col) + row;
                const cellData = cells.find(item => item.cell === cellId);
                const displayValue = await this.viewModel.getDisplayValue(cellData);
                const isFormula = cellData && cellData.data && cellData.data.toString().startsWith('=');
                const cellClass = (showFormulas && isFormula) ? 'cell-formula' : '';
                const hasError = !showFormulas && displayValue && displayValue.toString().startsWith('#ERROR');
                const errorClass = hasError ? 'cell-error' : '';

                // Add tip indicator class if cell has a tip
                const hasTip = cellData && cellData.metadata && cellData.metadata.tip;
                const tipClass = hasTip ? 'cell-has-tip' : '';

                table += `<td contenteditable="true" data-cell="${cellId}" class="${cellClass} ${errorClass} ${tipClass}">${this.escapeHtml(String(displayValue))}</td>`;
            }
            table += '</tr>';
        }
        table += '</tbody></table>';

        this.container.innerHTML = table;
        this.attachEditListeners();
        this.attachContextMenuListeners();
    }

    attachEditListeners() {
        const editableCells = this.container.querySelectorAll('td[contenteditable="true"]');

        editableCells.forEach(cell => {
            // Remove existing listener to avoid duplicates
            cell.removeEventListener('blur', this.handleBlur);

            // Create new blur handler
            this.handleBlur = async (event) => {
                const cellId = event.target.getAttribute('data-cell');
                const newValue = event.target.textContent;
                if (this.onCellEdit) {
                    await this.onCellEdit(cellId, newValue);
                }
            };

            cell.addEventListener('blur', this.handleBlur);
        });
    }

    attachContextMenuListeners() {
        const cells = this.container.querySelectorAll('td[contenteditable="true"]');

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
                    console.warn('AppController or handleContextMenu not available', {
                        hasAppController: !!this.appController,
                        hasWindowApp: !!window.app,
                        hasHandleContextMenu: !!(this.appController && this.appController.handleContextMenu)
                    });

                    // Fallback: show simple alert for debugging
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
}
