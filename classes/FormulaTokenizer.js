// Tokenizer for Formula Parsing
export default class FormulaTokenizer {
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
