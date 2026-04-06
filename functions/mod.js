// MOD(x, y) - returns x modulo y: x - y * INT(x/y)
export default function mod(args) {
    if (!args || args.length < 2) {
        throw new Error('MOD requires 2 arguments (x, y)');
    }

    let x = args[0];
    let y = args[1];

    if (typeof x !== 'number' || isNaN(x)) x = 0;
    if (typeof y !== 'number' || isNaN(y)) y = 0;

    if (y === 0) {
        throw new Error('MOD: division by zero');
    }

    return x - y * Math.floor(x / y);
}
