// SimpleFormulaParser.js - Supports shorthand cross-sheet ranges (first.A2:A4)
import ASTNode from './ASTNode.js';

export default class SimpleFormulaParser {
    constructor(formula) {
        this.formula = formula;
        this.pos = 0;
        this.len = formula.length;

        this.functions = new Set([
            'SUM', 'AVG', 'MAX', 'MIN', 'COUNT', 'SUMPRODUCT', 'VLOOKUP',
            'ABS', 'ACOS', 'ANGLE', 'ASIN', 'ATN', 'CEIL', 'COS', 'COT', 'CSC',
            'DEG', 'EXP', 'FLOOR', 'FP', 'INT', 'IP', 'LOG', 'LOG10', 'MOD',
            'RAD', 'RMD', 'RND', 'SEC', 'SGN', 'SIN', 'SQR', 'TAN',
            'DATE', 'EPS', 'INF', 'PI', 'TIME'
        ]);
    }

    parse() {
        return this.parseExpression();
    }

    parseExpression() {
        return this.parseAdditive();
    }

    parseAdditive() {
        let node = this.parseMultiplicative();

        while (this.pos < this.len) {
            this.skipWhitespace();
            if (this.pos >= this.len) break;

            const ch = this.formula[this.pos];
            if (ch === '+') {
                this.pos++;
                const right = this.parseMultiplicative();
                node = new ASTNode('BINARY_OP', { operator: '+', left: node, right: right });
            } else if (ch === '-') {
                this.pos++;
                const right = this.parseMultiplicative();
                node = new ASTNode('BINARY_OP', { operator: '-', left: node, right: right });
            } else {
                break;
            }
        }

        return node;
    }

     parseMultiplicative() {
        let node = this.parsePower();  // Changed from parsePrimary

        while (this.pos < this.len) {
            this.skipWhitespace();
            if (this.pos >= this.len) break;

            const ch = this.formula[this.pos];
            if (ch === '*') {
                this.pos++;
                const right = this.parsePower();  // Changed from parsePrimary
                node = new ASTNode('BINARY_OP', { operator: '*', left: node, right: right });
            } else if (ch === '/') {
                this.pos++;
                const right = this.parsePower();  // Changed from parsePrimary
                node = new ASTNode('BINARY_OP', { operator: '/', left: node, right: right });
            } else {
                break;
            }
        }

        return node;
    }

    parsePower() {
        let node = this.parsePrimary();

        while (this.pos < this.len) {
            this.skipWhitespace();
            if (this.pos >= this.len) break;

            const ch = this.formula[this.pos];
            if (ch === '^') {
                this.pos++;
                const right = this.parsePower();
                node = new ASTNode('BINARY_OP', { operator: '^', left: node, right: right });
            } else {
                break;
            }
        }

        return node;
    }

    parsePrimary() {
        this.skipWhitespace();

        if (this.pos >= this.len) {
            throw new Error('Unexpected end of expression');
        }

        const ch = this.formula[this.pos];

        // Number
        if (ch >= '0' && ch <= '9') {
            return this.parseNumber();
        }

        // String
        if (ch === '"' || ch === "'") {
            return this.parseString();
        }

        // Parenthesized expression
        if (ch === '(') {
            this.pos++;
            const node = this.parseExpression();
            this.skipWhitespace();
            if (this.pos < this.len && this.formula[this.pos] === ')') {
                this.pos++;
            }
            return node;
        }

        // Negative number
        if (ch === '-') {
            this.pos++;
            const node = this.parsePrimary();
            return new ASTNode('UNARY_MINUS', { operand: node });
        }

        // Identifier (function, cell reference, or cross-sheet reference)
        if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
            return this.parseIdentifierOrReference();
        }

        throw new Error(`Unexpected character: ${ch}`);
    }

    parseIdentifierOrReference() {
        // Parse the first part (could be sheet name or cell reference)
        const firstPart = this.parseIdentifier();

        this.skipWhitespace();

        // Check for dot (cross-sheet reference)
        if (this.pos < this.len && this.formula[this.pos] === '.') {
            this.pos++; // Skip '.'
            this.skipWhitespace();

            // Parse the second part (cell reference)
            const secondPart = this.parseIdentifier();

            this.skipWhitespace();

            // Check if it's a range reference (has colon) - shorthand format: sheet.A2:A4
            if (this.pos < this.len && this.formula[this.pos] === ':') {
                this.pos++; // Skip ':'
                this.skipWhitespace();

                // Parse the end cell (no dot, same sheet)
                const endCell = this.parseIdentifier();

                const startMatch = secondPart.match(/^([A-Za-z]+)(\d+)$/);
                const endMatch = endCell.match(/^([A-Za-z]+)(\d+)$/);

                if (startMatch && endMatch) {
                    const startCol = startMatch[1];
                    const startRow = parseInt(startMatch[2], 10);
                    const endCol = endMatch[1];
                    const endRow = parseInt(endMatch[2], 10);

                    return new ASTNode('RANGE_REF', {
                        sheet: firstPart,
                        startCol, startRow,
                        endCol, endRow,
                        fullRef: `${firstPart}.${secondPart}:${endCell}`
                    });
                }
            }

            // Single cell cross-sheet reference: sheet.A1
            const cellMatch = secondPart.match(/^([A-Za-z]+)(\d+)$/);
            if (cellMatch) {
                const colName = cellMatch[1];
                const rowNum = parseInt(cellMatch[2], 10);
                return new ASTNode('CELL_REF', {
                    sheet: firstPart,
                    col: colName,
                    row: rowNum,
                    fullRef: `${firstPart}.${secondPart}`
                });
            }

            throw new Error(`Invalid cross-sheet reference: ${firstPart}.${secondPart}`);
        }

        // Check for range reference within same sheet (A1:B3)
        if (this.pos < this.len && this.formula[this.pos] === ':') {
            this.pos++; // Skip ':'
            this.skipWhitespace();
            const secondPart = this.parseIdentifier();

            const startMatch = firstPart.match(/^([A-Za-z]+)(\d+)$/);
            const endMatch = secondPart.match(/^([A-Za-z]+)(\d+)$/);

            if (startMatch && endMatch) {
                const startCol = startMatch[1];
                const startRow = parseInt(startMatch[2], 10);
                const endCol = endMatch[1];
                const endRow = parseInt(endMatch[2], 10);

                return new ASTNode('RANGE_REF', {
                    sheet: null,
                    startCol, startRow,
                    endCol, endRow,
                    fullRef: `${firstPart}:${secondPart}`
                });
            }
        }

        // Check if it's a function call (followed by '(')
        if (this.pos < this.len && this.formula[this.pos] === '(') {
            return this.parseFunctionCall(firstPart);
        }

        // Check for boolean constants
        const upperFirst = firstPart.toUpperCase();
        if (upperFirst === 'TRUE') {
            return new ASTNode('NUMBER', { value: 1 });
        }
        if (upperFirst === 'FALSE') {
            return new ASTNode('NUMBER', { value: 0 });
        }

        // Check for constant like PI
        if (upperFirst === 'PI') {
            return new ASTNode('FUNCTION_CALL', { name: 'PI', arguments: [] });
        }

        // Check if it's a cell reference (e.g., A1)
        const cellMatch = firstPart.match(/^([A-Za-z]+)(\d+)$/);
        if (cellMatch) {
            const colName = cellMatch[1];
            const rowNum = parseInt(cellMatch[2], 10);
            return new ASTNode('CELL_REF', { sheet: null, col: colName, row: rowNum, fullRef: firstPart });
        }

        throw new Error(`Unexpected identifier: ${firstPart}`);
    }

    parseIdentifier() {
        let ident = '';

        while (this.pos < this.len) {
            const ch = this.formula[this.pos];
            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '_') {
                ident += ch;
                this.pos++;
            } else {
                break;
            }
        }

        return ident;
    }

    parseNumber() {
        let num = '';
        let hasDecimal = false;

        while (this.pos < this.len) {
            const ch = this.formula[this.pos];
            if (ch >= '0' && ch <= '9') {
                num += ch;
                this.pos++;
            } else if (ch === '.' && !hasDecimal) {
                hasDecimal = true;
                num += ch;
                this.pos++;
            } else {
                break;
            }
        }

        return new ASTNode('NUMBER', { value: parseFloat(num) });
    }

    parseString() {
        const quoteChar = this.formula[this.pos];
        this.pos++;
        let str = '';

        while (this.pos < this.len && this.formula[this.pos] !== quoteChar) {
            str += this.formula[this.pos];
            this.pos++;
        }

        this.pos++; // Skip closing quote
        return new ASTNode('STRING', { value: str });
    }


        parseFunctionCall(functionName) {
            this.pos++; // Skip '('
            const args = [];

            this.skipWhitespace();

            // Empty arguments
            if (this.pos < this.len && this.formula[this.pos] === ')') {
                this.pos++;
                return new ASTNode('FUNCTION_CALL', { name: functionName.toUpperCase(), arguments: args });
            }

            // Parse arguments
            while (this.pos < this.len) {
                const arg = this.parseExpression();
                args.push(arg);

                this.skipWhitespace();

                if (this.pos >= this.len) {
                    throw new Error('Unexpected end of function call');
                }

                const ch = this.formula[this.pos];
                if (ch === ')') {
                    this.pos++;
                    break;
                } else if (ch === ',' || ch === ';') {  // Support both comma and semicolon
                    this.pos++;
                    this.skipWhitespace();
                    continue;
                } else {
                    throw new Error(`Expected ',' or ')' in function call, got ${ch}`);
                }
            }

            return new ASTNode('FUNCTION_CALL', { name: functionName.toUpperCase(), arguments: args });
        }

    skipWhitespace() {
        while (this.pos < this.len && /\s/.test(this.formula[this.pos])) {
            this.pos++;
        }
    }
}
