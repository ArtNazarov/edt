// RAD(x) - converts degrees to radians
export default function rad(args) {
    if (!args || args.length === 0) {
        throw new Error('RAD requires 1 argument');
    }

    let x = args[0];
    if (typeof x !== 'number' || isNaN(x)) {
        x = 0;
    }

    return x * (Math.PI / 180);
}
