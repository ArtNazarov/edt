import ASTNode from './ASTNode.js';

// Parser for AST Generation
export default class FormulaParser {
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
