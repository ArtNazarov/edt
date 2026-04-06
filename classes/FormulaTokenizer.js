// FormulaTokenizer.js - Fixed to properly handle parentheses
export default class FormulaTokenizer {
    static tokenize(expression) {
        const tokens = [];
        let i = 0;
        const len = expression.length;

        while (i < len) {
            const ch = expression[i];

            // Skip whitespace
            if (/\s/.test(ch)) {
                i++;
                continue;
            }

            // Numbers (including decimals)
            if (/[0-9]/.test(ch)) {
                let num = '';
                let hasDecimal = false;
                while (i < len && (/[0-9]/.test(expression[i]) || (expression[i] === '.' && !hasDecimal))) {
                    if (expression[i] === '.') hasDecimal = true;
                    num += expression[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: num });
                continue;
            }

            // Strings (quoted)
            if (ch === '"' || ch === "'") {
                const quoteChar = ch;
                i++;
                let str = '';
                while (i < len && expression[i] !== quoteChar) {
                    str += expression[i];
                    i++;
                }
                i++; // Skip closing quote
                tokens.push({ type: 'STRING', value: str });
                continue;
            }

            // Identifiers (function names, cell references, sheet names)
            if (/[A-Za-z_]/.test(ch)) {
                let ident = '';
                while (i < len && /[A-Za-z0-9_]/.test(expression[i])) {
                    ident += expression[i];
                    i++;
                }
                tokens.push({ type: 'IDENTIFIER', value: ident });
                continue;
            }

            // Parentheses and operators
            if (ch === '(') {
                tokens.push({ type: 'OPERATOR', value: '(' });
                i++;
                continue;
            }

            if (ch === ')') {
                tokens.push({ type: 'OPERATOR', value: ')' });
                i++;
                continue;
            }

            if (ch === ',') {
                tokens.push({ type: 'OPERATOR', value: ',' });
                i++;
                continue;
            }

            if (ch === ':') {
                tokens.push({ type: 'OPERATOR', value: ':' });
                i++;
                continue;
            }

            if (ch === '.') {
                tokens.push({ type: 'OPERATOR', value: '.' });
                i++;
                continue;
            }

            if (ch === '+') {
                tokens.push({ type: 'OPERATOR', value: '+' });
                i++;
                continue;
            }

            if (ch === '-') {
                tokens.push({ type: 'OPERATOR', value: '-' });
                i++;
                continue;
            }

            if (ch === '*') {
                tokens.push({ type: 'OPERATOR', value: '*' });
                i++;
                continue;
            }

            if (ch === '/') {
                tokens.push({ type: 'OPERATOR', value: '/' });
                i++;
                continue;
            }

            // Unknown character
            throw new Error(`Unexpected character: ${ch}`);
        }

        return tokens;
    }
}
