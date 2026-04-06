// IP(x) - returns integer part of x (truncates toward zero)
export default function ip(args) {
    if (!args || args.length === 0) {
        throw new Error('IP requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return x < 0 ? Math.ceil(x) : Math.floor(x);
}
