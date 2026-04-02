// Function Registry for dynamic function loading
export default class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.loadingPromises = new Map();
        this.functionPathMap = {
            'SUM': '../functions/sum.js',
            'AVG': '../functions/avg.js',
            'MAX': '../functions/max.js',
            'MIN': '../functions/min.js',
            'COUNT': '../functions/count.js',
            'SUMPRODUCT': '../functions/sumproduct.js',
            'VLOOKUP': '../functions/vlookup.js'
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
}
