// ASTNode.js
export default class ASTNode {
    constructor(type, properties = {}) {
        this.type = type;

        switch (type) {
            case 'NUMBER':
                this.value = properties.value;
                break;
            case 'STRING':
                this.value = properties.value;
                break;
            case 'CELL_REF':
                this.sheet = properties.sheet || null;
                this.col = properties.col;
                this.row = properties.row;
                this.fullRef = properties.fullRef;
                break;
            case 'RANGE_REF':
                this.sheet = properties.sheet || null;
                this.startCol = properties.startCol;
                this.startRow = properties.startRow;
                this.endCol = properties.endCol;
                this.endRow = properties.endRow;
                this.fullRef = properties.fullRef;
                break;
            case 'BINARY_OP':
                this.operator = properties.operator;
                this.left = properties.left;
                this.right = properties.right;
                break;
            case 'UNARY_MINUS':
                this.operand = properties.operand;
                break;
            case 'FUNCTION_CALL':
                this.name = properties.name;
                this.arguments = properties.arguments || [];
                break;
            default:
                Object.assign(this, properties);
        }
    }
}
