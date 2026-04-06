// Function Registry for dynamic function loading
export default class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.loadingPromises = new Map();
        this.functionPathMap = {
            // Existing functions
            'SUM': '../functions/sum.js',
            'AVG': '../functions/avg.js',
            'MAX': '../functions/max.js',
            'MIN': '../functions/min.js',
            'COUNT': '../functions/count.js',
            'SUMPRODUCT': '../functions/sumproduct.js',
            'VLOOKUP': '../functions/vlookup.js',

            // Mathematical functions
            'ABS': '../functions/abs.js',
            'ACOS': '../functions/acos.js',
            'ANGLE': '../functions/angle.js',
            'ASIN': '../functions/asin.js',
            'ATN': '../functions/atn.js',
            'CEIL': '../functions/ceil.js',
            'COS': '../functions/cos.js',
            'COT': '../functions/cot.js',
            'CSC': '../functions/csc.js',
            'DEG': '../functions/deg.js',
            'EXP': '../functions/exp.js',
            'FLOOR': '../functions/floor.js',
            'FP': '../functions/fp.js',
            'INT': '../functions/floor.js',
            'IP': '../functions/ip.js',
            'LOG': '../functions/log.js',
            'LOG10': '../functions/log10.js',
            'MOD': '../functions/mod.js',
            'RAD': '../functions/rad.js',
            'RMD': '../functions/rmd.js',
            'SEC': '../functions/sec.js',
            'SGN': '../functions/sgn.js',
            'SIN': '../functions/sin.js',
            'SQR': '../functions/sqr.js',
            'TAN': '../functions/tan.js',

            // Constant/utility functions
            'DATE': '../functions/date.js',
            'EPS': '../functions/eps.js',
            'INF': '../functions/inf.js',
            'PI': '../functions/pi.js',
            'RND': '../functions/rnd.js',
            'TIME': '../functions/time.js'
        };
    }

    async loadFunction(functionName) {
        const upperName = functionName.toUpperCase();

        // Check if already loaded
        if (this.functions.has(upperName)) {
            return this.functions.get(upperName);
        }

        // Check if currently loading
        if (this.loadingPromises.has(upperName)) {
            return this.loadingPromises.get(upperName);
        }

        // Get the file path
        const filePath = this.functionPathMap[upperName];
        if (!filePath) {
            throw new Error(`Unknown function: ${upperName}`);
        }

        // Load the function module dynamically
        const loadPromise = import(filePath)
            .then(module => {
                const fn = module.default;
                this.functions.set(upperName, fn);
                this.loadingPromises.delete(upperName);
                console.log(`Function loaded: ${upperName}`);
                return fn;
            })
            .catch(error => {
                this.loadingPromises.delete(upperName);
                console.error(`Failed to load function ${upperName} from ${filePath}:`, error);
                throw new Error(`Function ${upperName} not available: ${error.message}`);
            });

        this.loadingPromises.set(upperName, loadPromise);
        return loadPromise;
    }

    isFunctionLoaded(functionName) {
        return this.functions.has(functionName.toUpperCase());
    }

    getLoadedFunctions() {
        return Array.from(this.functions.keys());
    }

    isFunctionRegistered(functionName) {
        const upperName = functionName.toUpperCase();
        return this.functionPathMap.hasOwnProperty(upperName);
    }

    getRegisteredFunctions() {
        return Object.keys(this.functionPathMap);
    }
}
