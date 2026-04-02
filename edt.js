// edt.js - Refactored with dynamic function loading
// Core engine without hardcoded spreadsheet functions

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

// ==================== Function Registry ====================
class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.loadingPromises = new Map();
        this.functionPathMap = {
            'SUM': './functions/sum.js',
            'AVG': './functions/avg.js',
            'MAX': './functions/max.js',
            'MIN': './functions/min.js',
            'COUNT': './functions/count.js',
            'SUMPRODUCT': './functions/sumproduct.js',
            'VLOOKUP': './functions/vlookup.js'
        };
    }

    async loadFunction(functionName) {
        const upperName = functionName.toUpperCase();

        // Check if already loaded
        if (this.functions.has(upperName)) {
            return this.functions.get(upperName);
        }

        // Check if currently loading
        if (this.loadingPromises.has(upperName)) {
            return this.loadingPromises.get(upperName);
        }

        // Get the file path
        const filePath = this.functionPathMap[upperName];
        if (!filePath) {
            throw new Error(`Unknown function: ${upperName}`);
        }

        // Load the function module dynamically
        const loadPromise = import(filePath)
            .then(module => {
                const fn = module.default;
                this.functions.set(upperName, fn);
                this.loadingPromises.delete(upperName);
                return fn;
            })
            .catch(error => {
                this.loadingPromises.delete(upperName);
                console.error(`Failed to load function ${upperName}:`, error);
                throw new Error(`Function ${upperName} not available: ${error.message}`);
            });

        this.loadingPromises.set(upperName, loadPromise);
        return loadPromise;
    }

    isFunctionLoaded(functionName) {
        return this.functions.has(functionName.toUpperCase());
    }

    getLoadedFunctions() {
        return Array.from(this.functions.keys());
    }
}

// ==================== AST Evaluator ====================
class ASTEvaluator {
    constructor(dataHolder, currentSheet) {
        this.dataHolder = dataHolder;
        this.currentSheet = currentSheet;
        this.cache = new Map();
        this.evaluationStack = new Set();
        this.functionRegistry = new FunctionRegistry();
    }

    clearCache() {
        this.cache.clear();
        this.evaluationStack.clear();
    }

    async evaluate(node, cellId = null) {
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
                    result = await this.evaluateCellReference(node.value);
                    break;

                case 'binaryOp':
                    result = await this.evaluateBinaryOp(node);
                    break;

                case 'function':
                    result = await this.evaluateFunction(node);
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

    async evaluateCellReference(ref) {
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
                const result = await evaluator.evaluate(ast, `${sheetName}!${cellRef}`);
                return result;
            } catch (e) {
                console.error(`Error evaluating ${cellData}:`, e);
                return `#ERROR: ${e.message}`;
            }
        }

        const num = parseFloat(cellData);
        if (!isNaN(num) && isFinite(num) && cellData.trim() !== '') {
            return Math.round(num * 100) / 100;
        }

        return cellData;
    }

    async evaluateBinaryOp(node) {
        const left = await this.evaluate(node.left);
        const right = await this.evaluate(node.right);

        if (typeof left === 'number' && typeof right === 'number') {
            let result;
            switch (node.value) {
                case '+': result = left + right; break;
                case '-': result = left - right; break;
                case '*': result = left * right; break;
                case '/': result = right !== 0 ? left / right : 0; break;
                default: result = 0;
            }
            return Math.round(result * 100) / 100;
        }

        if (node.value === '+') {
            return String(left) + String(right);
        }

        return 0;
    }

    async evaluateFunction(node) {
        const functionName = node.value;

        try {
            // Load the function dynamically
            const fn = await this.functionRegistry.loadFunction(functionName);

            // Create a context object with helper methods
            const context = {
                evaluateRange: async (startNode, endNode) => {
                    return await this.evaluateRange(startNode, endNode);
                },
                evaluate: async (argNode) => {
                    return await this.evaluate(argNode);
                },
                evaluateCellReference: async (ref) => {
                    return await this.evaluateCellReference(ref);
                },
                getSheet: (sheetName) => {
                    return this.dataHolder.getSheet(sheetName);
                },
                currentSheet: this.currentSheet,
                dataHolder: this.dataHolder,
                formatNumber: (num) => {
                    if (typeof num !== 'number') return num;
                    if (Number.isInteger(num)) return num;
                    return Math.round(num * 100) / 100;
                },
                columnToNumber: (col) => this.columnToNumber(col),
                numberToColumn: (num) => this.numberToColumn(num)
            };

            // Execute the function with node args and context
            const result = await fn(node.args, context);

            // Format numeric results
            if (typeof result === 'number' && !isNaN(result)) {
                return Math.round(result * 100) / 100;
            }
            return result;

        } catch (error) {
            console.error(`Error evaluating function ${functionName}:`, error);
            return `#ERROR: ${error.message}`;
        }
    }

    async evaluateRange(startNode, endNode) {
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
                const val = await this.evaluateCellReference(fullRef);
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

    async computeValue(sheetName, cellId, formula) {
        try {
            const evaluator = this.getEvaluator(sheetName);
            const expression = formula.substring(1).trim();
            const tokens = FormulaTokenizer.tokenize(expression);
            const parser = new FormulaParser(tokens);
            const ast = parser.parse();
            const result = await evaluator.evaluate(ast, `${sheetName}!${cellId}`);
            if (typeof result === 'number' && !isNaN(result)) {
                return evaluator.formatNumber(result);
            }
            return result !== undefined && result !== null ? result : '';
        } catch (error) {
            console.error(`Computation error for ${formula}:`, error);
            return `#ERROR: ${error.message}`;
        }
    }

    async computeCellValue(sheetName, cell) {
        if (!cell || !cell.data) return '';
        const dataStr = cell.data.toString();

        if (dataStr.startsWith('=')) {
            return await this.computeValue(sheetName, cell.cell, dataStr);
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

    async getDisplayValue(cellData) {
        if (!cellData || !cellData.data) return '';
        if (this.showFormulas) return cellData.data;

        if (cellData.data.toString().startsWith('=')) {
            return await this.computationEngine.computeCellValue(this.sheetName, cellData);
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
    async handleCellEdit(sheetName, cellId, newValue) {
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

    async updateViewAndViewModel() {
        this.viewModel = new ViewModel(this.dataHolder, this.dataHolder.currentSheet, this.computationEngine, this.showFormulas);
        this.sheetView = new SheetView('table-container', this.viewModel, async (cellId, newValue) => {
            await this.cellsController.handleCellEdit(this.dataHolder.currentSheet, cellId, newValue);
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        this.navController = new NavButtonsController(this.dataHolder, this.viewModel, async () => {
            await this.updateViewAndViewModel();
            this.updatePositionInfo();
        });
        await this.sheetView.render();
    }

    renderSheetsNav() {
        const nav = document.getElementById('sheets-nav');
        nav.innerHTML = '';
        this.dataHolder.getSheetNames().forEach(sheetName => {
            const link = document.createElement('span');
            link.className = `sheet-link ${this.dataHolder.currentSheet === sheetName ? 'active' : ''}`;
            link.textContent = sheetName;
            link.onclick = async () => await this.switchSheet(sheetName);
            nav.appendChild(link);
        });
    }

    async switchSheet(sheetName) {
        this.dataHolder.setCurrentSheet(sheetName);
        this.renderSheetsNav();
        await this.updateViewAndViewModel();
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
        if (formulasBtn) formulasBtn.addEventListener('click', async () => { this.showFormulas = true; await this.updateViewAndViewModel(); this.updateModeButtons(); this.updatePositionInfo(); });
        if (resultsBtn) resultsBtn.addEventListener('click', async () => { this.showFormulas = false; await this.updateViewAndViewModel(); this.updateModeButtons(); this.updatePositionInfo(); });
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
