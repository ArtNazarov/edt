// CSC(x) - returns cosecant of x (1/sin(x))
export default function csc(args) {
    if (!args || args.length === 0) {
        throw new Error('CSC requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    const sinVal = Math.sin(x);
    if (Math.abs(sinVal) < 1e-10) {
        throw new Error('CSC: undefined at multiples of π');
    }

    return 1 / sinVal;
}
