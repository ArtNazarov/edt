// ANGLE(x, y) - returns arctangent of y/x in proper quadrant
// Returns angle phi between x-axis and point (x, y) such that -pi < phi <= pi
export default function angle(args) {
    if (!args || args.length < 2) {
        throw new Error('ANGLE requires 2 arguments (x, y)');
    }

    let x = args[0];
    let y = args[1];

    if (typeof x !== 'number' || isNaN(x)) x = 0;
    if (typeof y !== 'number' || isNaN(y)) y = 0;

    return Math.atan2(y, x);
}
