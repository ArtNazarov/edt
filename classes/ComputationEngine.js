import ASTEvaluator from './ASTEvaluator.js';
import FormulaTokenizer from './FormulaTokenizer.js';
import FormulaParser from './FormulaParser.js';

// Computation Engine
export default class ComputationEngine {
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
