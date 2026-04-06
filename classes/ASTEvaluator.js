import SimpleFormulaParser from './SimpleFormulaParser.js';
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
                case 'NUMBER':
                    result = node.value;
                    break;

                case 'STRING':
                    result = node.value;
                    break;

                case 'CELL_REF':
                    result = await this.evaluateCellReference(node);
                    break;

                case 'RANGE_REF':
                    result = await this.evaluateRangeReference(node);
                    break;

                case 'BINARY_OP':
                    result = await this.evaluateBinaryOp(node);
                    break;

                case 'UNARY_MINUS':
                    result = await this.evaluateUnaryMinus(node);
                    break;

                case 'FUNCTION_CALL':
                    result = await this.evaluateFunctionCall(node);
                    break;

                default:
                    console.warn(`Unknown node type: ${node.type}`);
                    result = 0;
            }

            if (cellId) {
                // Cache numeric results only, not errors
                if (typeof result === 'number' && !isNaN(result)) {
                    this.cache.set(cellId, result);
                }
            }

            return result;
        } finally {
            if (cellId) this.evaluationStack.delete(cellId);
        }
    }

    async evaluateCellReference(node) {
        let sheetName = node.sheet || this.currentSheet;
        let cellRef = `${node.col}${node.row}`;

        const sheet = this.dataHolder.getSheet(sheetName);
        if (!sheet) return 0;

        const cell = sheet.cells.find(c => c.cell === cellRef);
        if (!cell || cell.data === undefined || cell.data === '') return 0;

        const cellData = cell.data.toString();

        if (cellData.startsWith('=')) {
            const evaluator = new ASTEvaluator(this.dataHolder, sheetName);
            try {
                // Use SimpleFormulaParser instead of FormulaParser
                const parser = new SimpleFormulaParser(cellData.substring(1));
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

    async evaluateRangeReference(node) {
        const sheetName = node.sheet || this.currentSheet;
        const startCol = this.columnToNumber(node.startCol);
        const startRow = node.startRow;
        const endCol = this.columnToNumber(node.endCol);
        const endRow = node.endRow;

        const values = [];

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const colName = this.numberToColumn(col);
                const cellRef = `${colName}${row}`;

                const sheet = this.dataHolder.getSheet(sheetName);
                if (sheet) {
                    const cell = sheet.cells.find(c => c.cell === cellRef);
                    if (cell && cell.data !== undefined && cell.data !== '') {
                        const cellData = cell.data.toString();
                        const num = parseFloat(cellData);
                        if (!isNaN(num) && isFinite(num)) {
                            values.push(num);
                        } else if (!cellData.startsWith('=')) {
                            // Non-numeric values are ignored in ranges
                            values.push(cellData);
                        } else {
                            // Evaluate formula cells
                            try {
                                const evaluator = new ASTEvaluator(this.dataHolder, sheetName);
                                const parser = new SimpleFormulaParser(cellData.substring(1));
                                const ast = parser.parse();
                                const result = await evaluator.evaluate(ast, `${sheetName}!${cellRef}`);
                                if (typeof result === 'number' && !isNaN(result)) {
                                    values.push(result);
                                }
                            } catch (e) {
                                console.error(`Error evaluating range cell ${cellRef}:`, e);
                            }
                        }
                    }
                }
            }
        }

        return values;
    }

    async evaluateBinaryOp(node) {
        const left = await this.evaluate(node.left);
        const right = await this.evaluate(node.right);

        // Handle string concatenation
        if (node.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
            return String(left) + String(right);
        }

        // Handle numeric operations
        if (typeof left === 'number' && typeof right === 'number') {
            let result;
            switch (node.operator) {
                case '+': result = left + right; break;
                case '-': result = left - right; break;
                case '*': result = left * right; break;
                case '/': result = right !== 0 ? left / right : 0; break;
                default: result = 0;
            }
            return Math.round(result * 100) / 100;
        }

        // Handle number + string cases
        if (node.operator === '+') {
            return String(left) + String(right);
        }

        return 0;
    }

    async evaluateUnaryMinus(node) {
        const value = await this.evaluate(node.operand);
        if (typeof value === 'number') {
            return -value;
        }
        return 0;
    }

    async evaluateFunctionCall(node) {
        const functionName = node.name;
        const args = node.arguments || [];

        try {
            // Load the function dynamically
            const fn = await this.functionRegistry.loadFunction(functionName);

            // Evaluate all arguments first
            const evaluatedArgs = [];
            for (const arg of args) {
                // Check if argument is a range reference
                if (arg.type === 'RANGE_REF') {
                    const rangeValues = await this.evaluateRangeReference(arg);
                    evaluatedArgs.push(rangeValues);
                } else {
                    const evaluated = await this.evaluate(arg);
                    evaluatedArgs.push(evaluated);
                }
            }

            console.log(`Function ${functionName} evaluated args:`, evaluatedArgs);

            // Create a context object with helper methods for functions
            const context = {
                evaluateRange: async (startNode, endNode) => {
                    return await this.evaluateRange(startNode, endNode);
                },
                evaluate: async (argNode) => {
                    return await this.evaluate(argNode);
                },
                evaluateCellReference: async (ref) => {
                    const cellNode = { type: 'CELL_REF', sheet: null, col: ref.col, row: ref.row };
                    return await this.evaluateCellReference(cellNode);
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
                numberToColumn: (num) => this.numberToColumn(num),
                parseCellAddress: (cellRef) => {
                    const match = cellRef.match(/([A-Z]+)(\d+)/);
                    if (match) {
                        return { col: match[1], row: parseInt(match[2], 10) };
                    }
                    return null;
                }
            };

            // Execute the function with evaluated args and context
            let result = await fn(evaluatedArgs, context, args);

            // Format numeric results
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                if (functionName === 'PI' || functionName === 'EPS') {
                    return result;
                }
                return Math.round(result * 100) / 100;
            }
            return result;

        } catch (error) {
            console.error(`Error evaluating function ${functionName}:`, error);
            return `#ERROR: ${error.message}`;
        }
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
        let n = num;
        while (n > 0) {
            n--;
            result = String.fromCharCode(65 + (n % 26)) + result;
            n = Math.floor(n / 26);
        }
        return result;
    }

    formatNumber(num) {
        if (typeof num !== 'number') return num;
        if (Number.isInteger(num)) return num;
        return Math.round(num * 100) / 100;
    }
}
