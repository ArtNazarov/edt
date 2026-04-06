// RMD(x, y) - returns remainder of x/y: x - y * IP(x/y)
export default function rmd(args) {
    if (!args || args.length < 2) {
        throw new Error('RMD requires 2 arguments (x, y)');
    }

    let x = args[0];
    let y = args[1];

    if (typeof x !== 'number' || isNaN(x)) x = 0;
    if (typeof y !== 'number' || isNaN(y)) y = 0;

    if (y === 0) {
        throw new Error('RMD: division by zero');
    }

    // IP is truncation toward zero
    const ip = x < 0 ? Math.ceil(x / y) : Math.floor(x / y);
    return x - y * ip;
}
