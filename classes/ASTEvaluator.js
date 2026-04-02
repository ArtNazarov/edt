import FormulaTokenizer from './FormulaTokenizer.js';
import FormulaParser from './FormulaParser.js';
import FunctionRegistry from './FunctionRegistry.js';

// AST Evaluator
export default class ASTEvaluator {
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
