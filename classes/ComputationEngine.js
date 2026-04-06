import ASTEvaluator from './ASTEvaluator.js';
import FormulaTokenizer from './FormulaTokenizer.js';
import SimpleFormulaParser from './SimpleFormulaParser.js';

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

    // In ComputationEngine.js, replace the parser import and usage:



// In computeValue method:
async computeValue(sheetName, cellId, formula) {
    try {
        const expression = formula.substring(1).trim();
        console.log(`Computing formula for ${sheetName}!${cellId}: ${expression}`);

        // Use SimpleFormulaParser instead
        const parser = new SimpleFormulaParser(expression);
        const ast = parser.parse();
        console.log('AST:', ast);

        const evaluator = this.getEvaluator(sheetName);
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

    // Helper method to compute all formulas in a sheet
    async computeSheet(sheetName) {
        const sheet = this.dataHolder.getSheet(sheetName);
        if (!sheet) return {};

        const results = {};
        for (const cell of sheet.cells) {
            if (cell.data && cell.data.toString().startsWith('=')) {
                results[cell.cell] = await this.computeCellValue(sheetName, cell);
            }
        }
        return results;
    }
}
