// edt.js - Fixed version with proper decimal handling and bug fixes
// Added SUMPRODUCT function support for range multiplication and summation

// ==================== AST Node Types ====================
class ASTNode {
    constructor(type, value = null, left = null, right = null) {
        this.type = type; // 'number', 'cellRef', 'function', 'binaryOp', 'unaryOp'
        this.value = value;
        this.left = left;
        this.right = right;
        this.args = [];
    }
}

// ==================== Tokenizer for Formula Parsing ====================
class FormulaTokenizer {
    static tokenize(expr) {
        const tokens = [];
        let i = 0;
        const len = expr.length;

        while (i < len) {
            let ch = expr[i];

            // Skip whitespace
            if (/\s/.test(ch)) {
                i++;
                continue;
            }

            // Numbers (including decimals)
            if (/[0-9]/.test(ch)) {
                let num = '';
                let decimalCount = 0;
                while (i < len && /[0-9.]/.test(expr[i])) {
                    if (expr[i] === '.') decimalCount++;
                    if (decimalCount > 1) break;
                    num += expr[i];
                    i++;
                }
                tokens.push({ type: 'number', value: parseFloat(num) });
                continue;
            }

            // Identifiers (cell references or function names)
            if (/[A-Za-z]/.test(ch)) {
                let ident = '';
                while (i < len && /[A-Za-z0-9_.]/.test(expr[i])) {
                    ident += expr[i];
                    i++;
                }
                tokens.push({ type: 'identifier', value: ident });
                continue;
            }

            // Operators and parentheses
            if ('+-*/()=,.:'.includes(ch)) {
                tokens.push({ type: 'operator', value: ch });
                i++;
                continue;
            }

            // Unknown character
            i++;
        }

        return tokens;
    }
}

// ==================== Parser for AST Generation ====================
class FormulaParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() {
        return this.tokens[this.pos];
    }

    consume(expectedType, expectedValue = null) {
        const token = this.peek();
        if (!token) throw new Error('Unexpected end of input');
        if (token.type !== expectedType) throw new Error(`Expected ${expectedType}, got ${token.type}`);
        if (expectedValue !== null && token.value !== expectedValue) throw new Error(`Expected ${expectedValue}, got ${token.value}`);
        this.pos++;
        return token;
    }

    parse() {
        return this.parseExpression();
    }

    parseExpression() {
        let node = this.parseTerm();

        while (this.peek() && this.peek().type === 'operator' && (this.peek().value === '+' || this.peek().value === '-')) {
            const op = this.consume('operator').value;
            const right = this.parseTerm();
            node = new ASTNode('binaryOp', op, node, right);
        }

        return node;
    }

    parseTerm() {
        let node = this.parseFactor();

        while (this.peek() && this.peek().type === 'operator' && (this.peek().value === '*' || this.peek().value === '/')) {
            const op = this.consume('operator').value;
            const right = this.parseFactor();
            node = new ASTNode('binaryOp', op, node, right);
        }

        return node;
    }

    parseFactor() {
        const token = this.peek();

        if (!token) throw new Error('Unexpected end of input');

        if (token.type === 'number') {
            this.consume('number');
            return new ASTNode('number', token.value);
        }

        if (token.type === 'identifier') {
            const ident = token.value;
            this.consume('identifier');

            // Check if it's a function call
            if (this.peek() && this.peek().type === 'operator' && this.peek().value === '(') {
                return this.parseFunction(ident);
            }

            // Cell reference (could be cross-sheet)
            return new ASTNode('cellRef', ident);
        }

        if (token.type === 'operator' && token.value === '(') {
            this.consume('operator', '(');
            const node = this.parseExpression();
            this.consume('operator', ')');
            return node;
        }

        throw new Error(`Unexpected token: ${token.type} ${token.value}`);
    }

    parseFunction(name) {
        const funcNode = new ASTNode('function', name.toUpperCase());
        this.consume('operator', '(');

        // Parse arguments (could be ranges or expressions)
        if (this.peek() && this.peek().type === 'operator' && this.peek().value === ')') {
            this.consume('operator', ')');
            return funcNode;
        }

        while (true) {
            // Check for range (e.g., A1:C3)
            const argStart = this.parseExpression();

            if (this.peek() && this.peek().type === 'operator' && this.peek().value === ':') {
                this.consume('operator', ':');
                const argEnd = this.parseExpression();
                funcNode.args.push({ type: 'range', start: argStart, end: argEnd });
            } else {
                funcNode.args.push({ type: 'expression', value: argStart });
            }

            if (this.peek() && this.peek().type === 'operator' && this.peek().value === ',') {
                this.consume('operator', ',');
                continue;
            }

            break;
        }

        this.consume('operator', ')');
        return funcNode;
    }
}

// ==================== AST Evaluator ====================
class ASTEvaluator {
    constructor(dataHolder, currentSheet) {
        this.dataHolder = dataHolder;
        this.currentSheet = currentSheet;
        this.cache = new Map();
        this.evaluationStack = new Set();
    }

    clearCache() {
        this.cache.clear();
        this.evaluationStack.clear();
    }

    evaluate(node, cellId = null) {
        if (!node) return 0;

        if (cellId && this.cache.has(cellId)) {
            return this.cache.get(cellId);
        }

        if (cellId && this.evaluationStack.has(cellId)) {
            throw new Error(`Circular reference detected at ${cellId}`);
        }

        if (cellId) this.evaluationStack.add(cellId);

        let result;

        try {
            switch (node.type) {
                case 'number':
                    result = node.value;
                    break;

                case 'cellRef':
                    result = this.evaluateCellReference(node.value);
                    break;

                case 'binaryOp':
                    result = this.evaluateBinaryOp(node);
                    break;

                case 'function':
                    result = this.evaluateFunction(node);
                    break;

                default:
                    result = 0;
            }

            if (cellId) {
                this.cache.set(cellId, result);
            }

            return result;
        } finally {
            if (cellId) this.evaluationStack.delete(cellId);
        }
    }

    evaluateCellReference(ref) {
        let sheetName = this.currentSheet;
        let cellRef = ref;

        const crossMatch = ref.match(/^([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)$/);
        if (crossMatch) {
            sheetName = crossMatch[1];
            cellRef = crossMatch[2];
        }

        const sheet = this.dataHolder.getSheet(sheetName);
        if (!sheet) return 0;

        const cell = sheet.cells.find(c => c.cell === cellRef);
        if (!cell || cell.data === undefined || cell.data === '') return 0;

        const cellData = cell.data.toString();

        if (cellData.startsWith('=')) {
            const evaluator = new ASTEvaluator(this.dataHolder, sheetName);
            try {
                const tokens = FormulaTokenizer.tokenize(cellData.substring(1));
                const parser = new FormulaParser(tokens);
                const ast = parser.parse();
                const result = evaluator.evaluate(ast, `${sheetName}!${cellRef}`);
                return result;
            } catch (e) {
                console.error(`Error evaluating ${cellData}:`, e);
                return `#ERROR: ${e.message}`;
            }
        }

        const num = parseFloat(cellData);
        if (!isNaN(num) && isFinite(num) && cellData.trim() !== '') {
            // Round to 2 decimal places to avoid floating point issues
            return Math.round(num * 100) / 100;
        }

        return cellData;
    }

    evaluateBinaryOp(node) {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        if (typeof left === 'number' && typeof right === 'number') {
            let result;
            switch (node.value) {
                case '+': result = left + right; break;
                case '-': result = left - right; break;
                case '*': result = left * right; break;
                case '/': result = right !== 0 ? left / right : 0; break;
                default: result = 0;
            }
            // Round to 2 decimal places to avoid floating point issues
            return Math.round(result * 100) / 100;
        }

        if (node.value === '+') {
            return String(left) + String(right);
        }

        return 0;
    }

    evaluateFunction(node) {
        // Handle SUMPRODUCT specially - it requires paired ranges
        if (node.value === 'SUMPRODUCT') {
            return this.evaluateSumProduct(node);
        }

        // For other functions, collect all numeric values
        const values = [];

        for (const arg of node.args) {
            if (arg.type === 'range') {
                const rangeValues = this.evaluateRange(arg.start, arg.end);
                values.push(...rangeValues);
            } else if (arg.type === 'expression') {
                const val = this.evaluate(arg.value);
                if (typeof val === 'number' && !isNaN(val)) {
                    values.push(val);
                }
            }
        }

        let result;
        switch (node.value) {
            case 'SUM':
                result = values.reduce((a, b) => a + b, 0);
                break;
            case 'AVG':
                if (values.length === 0) result = 0;
                else {
                    const sum = values.reduce((a, b) => a + b, 0);
                    result = sum / values.length;
                }
                break;
            case 'MAX':
                result = values.length > 0 ? Math.max(...values) : 0;
                break;
            case 'MIN':
                result = values.length > 0 ? Math.min(...values) : 0;
                break;
            case 'COUNT':
                result = values.length;
                break;
            default:
                result = 0;
        }
        // Round to 2 decimal places
        return Math.round(result * 100) / 100;
    }

    evaluateSumProduct(node) {
        // SUMPRODUCT requires an even number of arguments, typically ranges
        // Each pair of ranges is multiplied element-wise and summed
        const args = node.args;

        if (args.length < 2) {
            return '#ERROR: SUMPRODUCT requires at least two ranges';
        }

        // Parse each argument into an array of numeric values
        const argValues = [];

        for (const arg of args) {
            const values = [];
            if (arg.type === 'range') {
                const rangeValues = this.evaluateRange(arg.start, arg.end);
                values.push(...rangeValues);
            } else if (arg.type === 'expression') {
                const val = this.evaluate(arg.value);
                if (typeof val === 'number' && !isNaN(val)) {
                    values.push(val);
                }
            } else {
                return '#ERROR: SUMPRODUCT arguments must be ranges';
            }
            argValues.push(values);
        }

        // Check that all arguments have the same length
        const firstLength = argValues[0].length;
        for (let i = 1; i < argValues.length; i++) {
            if (argValues[i].length !== firstLength) {
                return '#ERROR: SUMPRODUCT ranges must have the same size';
            }
        }

        // If we have an odd number of arguments, treat them as pairs
        // If even number, pair them sequentially
        let total = 0;

        if (argValues.length === 2) {
            // Standard case: two ranges multiplied element-wise
            for (let i = 0; i < firstLength; i++) {
                total += argValues[0][i] * argValues[1][i];
            }
        } else {
            // For more than 2 arguments, we need to handle proper pairing
            // According to Excel: =SUMPRODUCT(A1:A5, B1:B5, C1:C5) = A1*B1*C1 + ... + A5*B5*C5
            // So we multiply across all arguments for each position
            for (let i = 0; i < firstLength; i++) {
                let product = argValues[0][i];
                for (let j = 1; j < argValues.length; j++) {
                    product *= argValues[j][i];
                }
                total += product;
            }
        }

        // Round to 2 decimal places
        return Math.round(total * 100) / 100;
    }

    evaluateRange(startNode, endNode) {
        const startRef = startNode.value;
        const endRef = endNode.value;

        let sheetPrefix = '';
        let startCell = startRef;
        let endCell = endRef;

        const startMatch = startRef.match(/^([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)$/);
        if (startMatch) {
            sheetPrefix = startMatch[1] + '.';
            startCell = startMatch[2];
        }

        const endMatch = endRef.match(/^([a-zA-Z0-9_]+)\.([A-Z]+[0-9]+)$/);
        if (endMatch) {
            endCell = endMatch[2];
        }

        const startColMatch = startCell.match(/[A-Z]+/);
        const startRowMatch = startCell.match(/[0-9]+/);
        const endColMatch = endCell.match(/[A-Z]+/);
        const endRowMatch = endCell.match(/[0-9]+/);

        if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
            return [];
        }

        const startCol = this.columnToNumber(startColMatch[0]);
        const startRow = parseInt(startRowMatch[0]);
        const endCol = this.columnToNumber(endColMatch[0]);
        const endRow = parseInt(endRowMatch[0]);

        const values = [];

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cellRef = this.numberToColumn(col) + row;
                const fullRef = sheetPrefix ? sheetPrefix + cellRef : cellRef;
                const val = this.evaluateCellReference(fullRef);
                if (typeof val === 'number' && !isNaN(val)) {
                    values.push(val);
                }
            }
        }

        return values;
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
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }

    formatNumber(num) {
        if (typeof num !== 'number') return num;
        if (Number.isInteger(num)) return num;
        return Math.round(num * 100) / 100;
    }
}

// ==================== ComputationEngine ====================
class ComputationEngine {
    constructor(dataHolder) {
        this.dataHolder = dataHolder;
        this.evaluatorCache = new Map();
    }

    getEvaluator(sheetName) {
        if (!this.evaluatorCache.has(sheetName)) {
            this.evaluatorCache.set(sheetName, new ASTEvaluator(this.dataHolder, sheetName));
        }
        return this.evaluatorCache.get(sheetName);
    }

    clearCache(sheetName = null) {
        if (sheetName) {
            const evaluator = this.evaluatorCache.get(sheetName);
            if (evaluator) evaluator.clearCache();
        } else {
            this.evaluatorCache.forEach(evaluator => evaluator.clearCache());
        }
    }

    computeValue(sheetName, cellId, formula) {
        try {
            const evaluator = this.getEvaluator(sheetName);
            const expression = formula.substring(1).trim();
            const tokens = FormulaTokenizer.tokenize(expression);
            const parser = new FormulaParser(tokens);
            const ast = parser.parse();
            const result = evaluator.evaluate(ast, `${sheetName}!${cellId}`);
            if (typeof result === 'number' && !isNaN(result)) {
                return evaluator.formatNumber(result);
            }
            return result !== undefined && result !== null ? result : '';
        } catch (error) {
            console.error(`Computation error for ${formula}:`, error);
            return `#ERROR: ${error.message}`;
        }
    }

    computeCellValue(sheetName, cell) {
        if (!cell || !cell.data) return '';
        const dataStr = cell.data.toString();

        if (dataStr.startsWith('=')) {
            return this.computeValue(sheetName, cell.cell, dataStr);
        }

        const num = parseFloat(dataStr);
        return isNaN(num) ? dataStr : Math.round(num * 100) / 100;
    }
}

// ==================== DataHolder ====================
class DataHolder {
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

// ==================== ViewModel ====================
class ViewModel {
    constructor(dataHolder, sheetName, computationEngine, showFormulas = true) {
        this.dataHolder = dataHolder;
        this.sheetName = sheetName;
        this.computationEngine = computationEngine;
        this.showFormulas = showFormulas;
        this.MAX_ROW = 999;
        this.MAX_COL_INDEX = 18278;
        this.VIEWPORT_WIDTH_COLS = 7;
        this.VIEWPORT_HEIGHT_ROWS = 7;
    }

    setShowFormulas(show) {
        this.showFormulas = show;
        if (!show) {
            this.computationEngine.clearCache(this.sheetName);
        }
    }

    getStartRow() { return this.dataHolder.getSheet(this.sheetName).start_row; }
    getStartCol() { return this.dataHolder.getSheet(this.sheetName).start_col; }
    getEndRow() { return Math.min(this.getStartRow() + this.VIEWPORT_HEIGHT_ROWS - 1, this.MAX_ROW); }
    getEndCol() { return Math.min(this.getStartCol() + this.VIEWPORT_WIDTH_COLS - 1, this.MAX_COL_INDEX); }
    getCells() { return this.dataHolder.getSheet(this.sheetName).cells; }
    canMoveUp() { return this.getStartRow() > 1; }
    canMoveDown() { return this.getStartRow() < this.MAX_ROW - this.VIEWPORT_HEIGHT_ROWS + 1; }
    canMoveLeft() { return this.getStartCol() > 1; }
    canMoveRight() { return this.getStartCol() < this.MAX_COL_INDEX - this.VIEWPORT_WIDTH_COLS + 1; }

    getDisplayValue(cellData) {
        if (!cellData || !cellData.data) return '';
        if (this.showFormulas) return cellData.data;

        if (cellData.data.toString().startsWith('=')) {
            return this.computationEngine.computeCellValue(this.sheetName, cellData);
        }
        return cellData.data;
    }
}

// ==================== SheetView ====================
class SheetView {
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

    render() {
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
                const displayValue = this.viewModel.getDisplayValue(cellData);
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
            this.handleBlur = (event) => {
                const cellId = event.target.getAttribute('data-cell');
                const newValue = event.target.textContent;
                if (this.onCellEdit) this.onCellEdit(cellId, newValue);
            };
            cell.addEventListener('blur', this.handleBlur);
        });
    }
}

// ==================== NavButtonsController ====================
class NavButtonsController {
    constructor(dataHolder, viewModel, onViewportChange) {
        this.dataHolder = dataHolder; this.viewModel = viewModel; this.onViewportChange = onViewportChange;
    }
    moveToTop() { this.dataHolder.updateViewport(this.viewModel.sheetName, 1, this.viewModel.getStartCol()); this.onViewportChange(); }
    moveToBottom() { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.MAX_ROW - this.viewModel.VIEWPORT_HEIGHT_ROWS + 1, this.viewModel.getStartCol()); this.onViewportChange(); }
    moveToLeft() { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), 1); this.onViewportChange(); }
    moveToRight() { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.MAX_COL_INDEX - this.viewModel.VIEWPORT_WIDTH_COLS + 1); this.onViewportChange(); }
    stepUp() { if (this.viewModel.canMoveUp()) { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() - 1, this.viewModel.getStartCol()); this.onViewportChange(); } }
    stepDown() { if (this.viewModel.canMoveDown()) { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow() + 1, this.viewModel.getStartCol()); this.onViewportChange(); } }
    stepLeft() { if (this.viewModel.canMoveLeft()) { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() - 1); this.onViewportChange(); } }
    stepRight() { if (this.viewModel.canMoveRight()) { this.dataHolder.updateViewport(this.viewModel.sheetName, this.viewModel.getStartRow(), this.viewModel.getStartCol() + 1); this.onViewportChange(); } }
}

// ==================== CellsEditablesController ====================
class CellsEditablesController {
    constructor(dataHolder, computationEngine) { this.dataHolder = dataHolder; this.computationEngine = computationEngine; }
    handleCellEdit(sheetName, cellId, newValue) {
        this.dataHolder.updateCell(sheetName, cellId, newValue);
        this.computationEngine.clearCache(sheetName);
    }
}

// ==================== AppController ====================
class AppController {
    constructor() {
        this.dataHolder = new DataHolder();
        this.computationEngine = new ComputationEngine(this.dataHolder);
        this.cellsController = new CellsEditablesController(this.dataHolder, this.computationEngine);
        this.showFormulas = true;
        this.init();
    }

    init() {
        this.renderSheetsNav();
        this.updateViewAndViewModel();
        this.attachGlobalButtonHandlers();
        this.attachModeButtonHandlers();
        this.updatePositionInfo();
        this.updateModeButtons();
    }

    updateViewAndViewModel() {
        this.viewModel = new ViewModel(this.dataHolder, this.dataHolder.currentSheet, this.computationEngine, this.showFormulas);
        this.sheetView = new SheetView('table-container', this.viewModel, (cellId, newValue) => {
            this.cellsController.handleCellEdit(this.dataHolder.currentSheet, cellId, newValue);
            this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        this.navController = new NavButtonsController(this.dataHolder, this.viewModel, () => {
            this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        this.sheetView.render();
    }

    renderSheetsNav() {
        const nav = document.getElementById('sheets-nav');
        nav.innerHTML = '';
        this.dataHolder.getSheetNames().forEach(sheetName => {
            const link = document.createElement('span');
            link.className = `sheet-link ${this.dataHolder.currentSheet === sheetName ? 'active' : ''}`;
            link.textContent = sheetName;
            link.onclick = () => this.switchSheet(sheetName);
            nav.appendChild(link);
        });
    }

    switchSheet(sheetName) {
        this.dataHolder.setCurrentSheet(sheetName);
        this.renderSheetsNav();
        this.updateViewAndViewModel();
        this.updatePositionInfo();
    }

    attachGlobalButtonHandlers() {
        window.moveToTop = () => this.navController.moveToTop();
        window.moveToBottom = () => this.navController.moveToBottom();
        window.stepUp = () => this.navController.stepUp();
        window.stepDown = () => this.navController.stepDown();
        window.moveToLeft = () => this.navController.moveToLeft();
        window.moveToRight = () => this.navController.moveToRight();
        window.stepLeft = () => this.navController.stepLeft();
        window.stepRight = () => this.navController.stepRight();
    }

    attachModeButtonHandlers() {
        const formulasBtn = document.getElementById('formulas-mode-btn');
        const resultsBtn = document.getElementById('results-mode-btn');
        if (formulasBtn) formulasBtn.addEventListener('click', () => { this.showFormulas = true; this.updateViewAndViewModel(); this.updateModeButtons(); this.updatePositionInfo(); });
        if (resultsBtn) resultsBtn.addEventListener('click', () => { this.showFormulas = false; this.updateViewAndViewModel(); this.updateModeButtons(); this.updatePositionInfo(); });
    }

    updateModeButtons() {
        const formulasBtn = document.getElementById('formulas-mode-btn');
        const resultsBtn = document.getElementById('results-mode-btn');
        if (formulasBtn && resultsBtn) {
            if (this.showFormulas) { formulasBtn.classList.add('active'); resultsBtn.classList.remove('active'); }
            else { formulasBtn.classList.remove('active'); resultsBtn.classList.add('active'); }
        }
    }

    getColumnLetter(colIndex) {
        let letter = ''; let index = colIndex;
        while (index > 0) { index--; letter = String.fromCharCode(65 + (index % 26)) + letter; index = Math.floor(index / 26); }
        return letter;
    }

    updatePositionInfo() {
        const sheet = this.dataHolder.getCurrentSheet();
        const end_row = sheet.start_row + 6;
        const end_col = sheet.start_col + 6;
        const modeText = this.showFormulas ? 'Formulas Mode' : 'Results Mode';
        document.getElementById('position-info').textContent = `${modeText} | Viewport: Rows ${sheet.start_row}-${end_row}, Cols ${this.getColumnLetter(sheet.start_col)}-${this.getColumnLetter(end_col)}`;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => { window.app = new AppController(); });
