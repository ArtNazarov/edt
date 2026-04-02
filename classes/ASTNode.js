// AST Node Types
export default class ASTNode {
    constructor(type, value = null, left = null, right = null) {
        this.type = type; // 'number', 'cellRef', 'function', 'binaryOp', 'unaryOp'
        this.value = value;
        this.left = left;
        this.right = right;
        this.args = [];
    }
}
