// SheetView - Renders the current viewport as an HTML table
export default class SheetView {
    constructor(containerId, viewModel, onCellEdit) {
        this.container = document.getElementById(containerId);
        this.viewModel = viewModel;
        this.onCellEdit = onCellEdit;
    }

    getColumnLetter(colIndex) {
        let letter = '';
        let index = colIndex;
        while (index > 0) { index--; letter = String.fromCharCode(65 + (index % 26)) + letter; index = Math.floor(index / 26); }
        return letter;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    async render() {
        const start_row = this.viewModel.getStartRow(), start_col = this.viewModel.getStartCol();
        const end_row = this.viewModel.getEndRow(), end_col = this.viewModel.getEndCol();
        const cells = this.viewModel.getCells();
        const showFormulas = this.viewModel.showFormulas;

        let table = '<table><thead>;<th>Row</th>';
        for (let col = start_col; col <= end_col; col++) table += `<th>${this.getColumnLetter(col)}</th>`;
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
                table += `<td contenteditable="true" data-cell="${cellId}" class="${cellClass} ${errorClass}">${this.escapeHtml(String(displayValue))}</td>`;
            }
            table += '</tr>';
        }
        table += '</tbody></table>';
        this.container.innerHTML = table;
        this.attachEditListeners();
    }

    attachEditListeners() {
        const editableCells = this.container.querySelectorAll('td[contenteditable="true"]');
        editableCells.forEach(cell => {
            cell.removeEventListener('blur', this.handleBlur);
            this.handleBlur = async (event) => {
                const cellId = event.target.getAttribute('data-cell');
                const newValue = event.target.textContent;
                if (this.onCellEdit) await this.onCellEdit(cellId, newValue);
            };
            cell.addEventListener('blur', this.handleBlur);
        });
    }
}
