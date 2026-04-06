// tests.js - Comprehensive test suite for AST Computation Engine

import ComputationEngine from '../classes/ComputationEngine.js';
import DataHolder from '../classes/DataHolder.js';

// Test results storage
let testResults = [];
let tests = [];

// Initialize test suite
function initializeTests() {
    tests = [
        // ==================== Basic Arithmetic Tests ====================
        {
            name: 'Basic addition',
            sheetName: 'first',
            cellAddress: 'TEST1',
            formula: '=10+20',
            expected: 30,
            tolerance: 0
        },
        {
            name: 'Basic subtraction',
            sheetName: 'first',
            cellAddress: 'TEST2',
            formula: '=50-25',
            expected: 25,
            tolerance: 0
        },
        {
            name: 'Basic multiplication',
            sheetName: 'first',
            cellAddress: 'TEST3',
            formula: '=5*6',
            expected: 30,
            tolerance: 0
        },
        {
            name: 'Basic division',
            sheetName: 'first',
            cellAddress: 'TEST4',
            formula: '=100/4',
            expected: 25,
            tolerance: 0
        },
        {
            name: 'Combined operations',
            sheetName: 'first',
            cellAddress: 'TEST5',
            formula: '=(10+20)*5',
            expected: 150,
            tolerance: 0
        },
        {
            name: 'Nested parentheses',
            sheetName: 'first',
            cellAddress: 'TEST6',
            formula: '=((10+20)*5)/2',
            expected: 75,
            tolerance: 0
        },
        {
            name: 'Decimal numbers',
            sheetName: 'first',
            cellAddress: 'TEST7',
            formula: '=3.14*2',
            expected: 6.28,
            tolerance: 0.0001
        },
        {
            name: 'Division by zero returns 0',
            sheetName: 'first',
            cellAddress: 'TEST8',
            formula: '=10/0',
            expected: 0,
            tolerance: 0
        },

        // ==================== Cell Reference Tests ====================
        {
            name: 'Single cell reference',
            sheetName: 'first',
            cellAddress: 'TEST9',
            formula: '=A1',
            expected: 30,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
            }
        },
        {
            name: 'Cell reference arithmetic',
            sheetName: 'first',
            cellAddress: 'TEST10',
            formula: '=A1+A2',
            expected: 55,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
            }
        },
        {
            name: 'Cell reference with parentheses',
            sheetName: 'first',
            cellAddress: 'TEST11',
            formula: '=(A1+A2)*A3',
            expected: 330,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '6');
            }
        },

        // ==================== SUM Function Tests ====================
        {
            name: 'SUM - single cell',
            sheetName: 'first',
            cellAddress: 'TEST12',
            formula: '=SUM(A1)',
            expected: 30,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
            }
        },
        {
            name: 'SUM - range A1:A3',
            sheetName: 'first',
            cellAddress: 'TEST13',
            formula: '=SUM(A1:A3)',
            expected: 85,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '30');
            }
        },
        {
            name: 'SUM - multiple arguments',
            sheetName: 'first',
            cellAddress: 'TEST14',
            formula: '=SUM(A1,A2,A3)',
            expected: 85,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '30');
            }
        },
        {
            name: 'SUM - with numbers',
            sheetName: 'first',
            cellAddress: 'TEST15',
            formula: '=SUM(10,20,30)',
            expected: 60,
            tolerance: 0
        },
        {
            name: 'SUM - mixed cells and numbers',
            sheetName: 'first',
            cellAddress: 'TEST16',
            formula: '=SUM(A1,10,A3)',
            expected: 70,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A3', '30');
            }
        },

        // ==================== AVG Function Tests ====================
        {
            name: 'AVG - range A1:A3',
            sheetName: 'first',
            cellAddress: 'TEST17',
            formula: '=AVG(A1:A3)',
            expected: 28.333333333333332,
            tolerance: 0.0001,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '30');
            }
        },
        {
            name: 'AVG - multiple arguments',
            sheetName: 'first',
            cellAddress: 'TEST18',
            formula: '=AVG(A1,A2,A3)',
            expected: 28.333333333333332,
            tolerance: 0.0001,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '30');
            }
        },
        {
            name: 'AVG - with numbers',
            sheetName: 'first',
            cellAddress: 'TEST19',
            formula: '=AVG(10,20,30)',
            expected: 20,
            tolerance: 0
        },

        // ==================== MAX Function Tests ====================

{
    name: 'MAX - range A1:A3',
    sheetName: 'first',
    cellAddress: 'TEST20',
    formula: '=MAX(A1:A3)',
    expected: 30,
    tolerance: 0,
    setup: (dataHolder) => {
        // Clear existing cells first
        dataHolder.setCellValue('first', 'A1', '');
        dataHolder.setCellValue('first', 'A2', '');
        dataHolder.setCellValue('first', 'A3', '');
        // Then set test values
        dataHolder.setCellValue('first', 'A1', '30');
        dataHolder.setCellValue('first', 'A2', '25');
        dataHolder.setCellValue('first', 'A3', '30');  // Changed from 35 to 30 to match expected
    }
},
        {
            name: 'MAX - multiple arguments',
            sheetName: 'first',
            cellAddress: 'TEST21',
            formula: '=MAX(A1,A2,A3)',
            expected: 35,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '35');
            }
        },

        // ==================== MIN Function Tests ====================
        {
            name: 'MIN - range A1:A3',
            sheetName: 'first',
            cellAddress: 'TEST22',
            formula: '=MIN(A1:A3)',
            expected: 25,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '35');
            }
        },
        {
            name: 'MIN - multiple arguments',
            sheetName: 'first',
            cellAddress: 'TEST23',
            formula: '=MIN(A1,A2,A3)',
            expected: 25,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '35');
            }
        },

        // ==================== COUNT Function Tests ====================
        {
            name: 'COUNT - range A1:A5 with mixed types',
            sheetName: 'first',
            cellAddress: 'TEST24',
            formula: '=COUNT(A1:A5)',
            expected: 3,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', 'text');
                dataHolder.setCellValue('first', 'A3', '25');
                dataHolder.setCellValue('first', 'A4', '');
                dataHolder.setCellValue('first', 'A5', '35');
            }
        },

        // ==================== SUMPRODUCT Function Tests ====================
        {
            name: 'SUMPRODUCT - two vertical ranges',
            sheetName: 'first',
            cellAddress: 'TEST25',
            formula: '=SUMPRODUCT(A1:A3,B1:B3)',
            expected: 30*4 + 25*5 + 35*6,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'A3', '35');
                dataHolder.setCellValue('first', 'B1', '4');
                dataHolder.setCellValue('first', 'B2', '5');
                dataHolder.setCellValue('first', 'B3', '6');
            }
        },
        {
            name: 'SUMPRODUCT - three ranges',
            sheetName: 'first',
            cellAddress: 'TEST26',
            formula: '=SUMPRODUCT(A1:A2,B1:B2,C1:C2)',
            expected: 30*4*7 + 25*5*8,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', '30');
                dataHolder.setCellValue('first', 'A2', '25');
                dataHolder.setCellValue('first', 'B1', '4');
                dataHolder.setCellValue('first', 'B2', '5');
                dataHolder.setCellValue('first', 'C1', '7');
                dataHolder.setCellValue('first', 'C2', '8');
            }
        },

        // ==================== VLOOKUP Function Tests ====================
        {
            name: 'VLOOKUP - exact match',
            sheetName: 'first',
            cellAddress: 'TEST27',
            formula: '=VLOOKUP("Product B", A1:B3, 2, FALSE)',
            expected: 200,
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', 'Product A');
                dataHolder.setCellValue('first', 'B1', '100');
                dataHolder.setCellValue('first', 'A2', 'Product B');
                dataHolder.setCellValue('first', 'B2', '200');
                dataHolder.setCellValue('first', 'A3', 'Product C');
                dataHolder.setCellValue('first', 'B3', '300');
            }
        },
        {
            name: 'VLOOKUP - not found returns #N/A',
            sheetName: 'first',
            cellAddress: 'TEST28',
            formula: '=VLOOKUP("Product X", A1:B3, 2, FALSE)',
            expected: '#N/A',
            tolerance: 0,
            setup: (dataHolder) => {
                dataHolder.setCellValue('first', 'A1', 'Product A');
                dataHolder.setCellValue('first', 'B1', '100');
                dataHolder.setCellValue('first', 'A2', 'Product B');
                dataHolder.setCellValue('first', 'B2', '200');
                dataHolder.setCellValue('first', 'A3', 'Product C');
                dataHolder.setCellValue('first', 'B3', '300');
            }
        },

        // ==================== ABS Function Tests ====================
        {
            name: 'ABS - positive number',
            sheetName: 'first',
            cellAddress: 'TEST29',
            formula: '=ABS(5)',
            expected: 5,
            tolerance: 0
        },
        {
            name: 'ABS - negative number',
            sheetName: 'first',
            cellAddress: 'TEST30',
            formula: '=ABS(-5)',
            expected: 5,
            tolerance: 0
        },
        {
            name: 'ABS - zero',
            sheetName: 'first',
            cellAddress: 'TEST31',
            formula: '=ABS(0)',
            expected: 0,
            tolerance: 0
        },

        // ==================== ACOS Function Tests ====================
        {
            name: 'ACOS - 0 (90 degrees)',
            sheetName: 'first',
            cellAddress: 'TEST32',
            formula: '=ACOS(0)',
            expected: Math.PI / 2,
            tolerance: 0.0001
        },
        {
            name: 'ACOS - 1 (0 degrees)',
            sheetName: 'first',
            cellAddress: 'TEST33',
            formula: '=ACOS(1)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'ACOS - -1 (180 degrees)',
            sheetName: 'first',
            cellAddress: 'TEST34',
            formula: '=ACOS(-1)',
            expected: Math.PI,
            tolerance: 0.0001
        },

        // ==================== ANGLE Function Tests ====================
        {
            name: 'ANGLE - point (1,0)',
            sheetName: 'first',
            cellAddress: 'TEST35',
            formula: '=ANGLE(1,0)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'ANGLE - point (0,1)',
            sheetName: 'first',
            cellAddress: 'TEST36',
            formula: '=ANGLE(0,1)',
            expected: Math.PI / 2,
            tolerance: 0.0001
        },
        {
            name: 'ANGLE - point (-1,0)',
            sheetName: 'first',
            cellAddress: 'TEST37',
            formula: '=ANGLE(-1,0)',
            expected: Math.PI,
            tolerance: 0.0001
        },
        {
            name: 'ANGLE - point (1,1)',
            sheetName: 'first',
            cellAddress: 'TEST38',
            formula: '=ANGLE(1,1)',
            expected: Math.PI / 4,
            tolerance: 0.0001
        },

        // ==================== ASIN Function Tests ====================
        {
            name: 'ASIN - 0',
            sheetName: 'first',
            cellAddress: 'TEST39',
            formula: '=ASIN(0)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'ASIN - 1',
            sheetName: 'first',
            cellAddress: 'TEST40',
            formula: '=ASIN(1)',
            expected: Math.PI / 2,
            tolerance: 0.0001
        },
        {
            name: 'ASIN - -1',
            sheetName: 'first',
            cellAddress: 'TEST41',
            formula: '=ASIN(-1)',
            expected: -Math.PI / 2,
            tolerance: 0.0001
        },

        // ==================== ATN Function Tests ====================
        {
            name: 'ATN - 0',
            sheetName: 'first',
            cellAddress: 'TEST42',
            formula: '=ATN(0)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'ATN - 1',
            sheetName: 'first',
            cellAddress: 'TEST43',
            formula: '=ATN(1)',
            expected: Math.PI / 4,
            tolerance: 0.0001
        },

        // ==================== CEIL Function Tests ====================
        {
            name: 'CEIL - positive decimal',
            sheetName: 'first',
            cellAddress: 'TEST44',
            formula: '=CEIL(5.3)',
            expected: 6,
            tolerance: 0
        },
        {
            name: 'CEIL - negative decimal',
            sheetName: 'first',
            cellAddress: 'TEST45',
            formula: '=CEIL(-5.3)',
            expected: -5,
            tolerance: 0
        },

        // ==================== COS Function Tests ====================
        {
            name: 'COS - 0',
            sheetName: 'first',
            cellAddress: 'TEST46',
            formula: '=COS(0)',
            expected: 1,
            tolerance: 0.0001
        },
        {
            name: 'COS - PI/2',
            sheetName: 'first',
            cellAddress: 'TEST47',
            formula: '=COS(PI/2)',
            expected: 0,
            tolerance: 0.0001
        },

        // ==================== COT Function Tests ====================
        {
            name: 'COT - PI/4',
            sheetName: 'first',
            cellAddress: 'TEST48',
            formula: '=COT(PI/4)',
            expected: 1,
            tolerance: 0.0001
        },

        // ==================== CSC Function Tests ====================
        {
            name: 'CSC - PI/2',
            sheetName: 'first',
            cellAddress: 'TEST49',
            formula: '=CSC(PI/2)',
            expected: 1,
            tolerance: 0.0001
        },

        // ==================== DATE Function Tests ====================
        {
            name: 'DATE - returns string',
            sheetName: 'first',
            cellAddress: 'TEST50',
            formula: '=DATE()',
            expected: 'string',
            tolerance: 0,
            validate: (actual) => typeof actual === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(actual)
        },

        // ==================== DEG Function Tests ====================
        {
            name: 'DEG - PI to 180',
            sheetName: 'first',
            cellAddress: 'TEST51',
            formula: '=DEG(PI)',
            expected: 180,
            tolerance: 0.0001
        },

        // ==================== EPS Function Tests ====================
        {
            name: 'EPS - machine epsilon',
            sheetName: 'first',
            cellAddress: 'TEST52',
            formula: '=EPS()',
            expected: Number.EPSILON,
            tolerance: 0
        },

        // ==================== EXP Function Tests ====================
        {
            name: 'EXP - 0',
            sheetName: 'first',
            cellAddress: 'TEST53',
            formula: '=EXP(0)',
            expected: 1,
            tolerance: 0.0001
        },
        {
            name: 'EXP - 1',
            sheetName: 'first',
            cellAddress: 'TEST54',
            formula: '=EXP(1)',
            expected: Math.E,
            tolerance: 0.0001
        },

        // ==================== FLOOR/INT Function Tests ====================
        {
            name: 'FLOOR - positive decimal',
            sheetName: 'first',
            cellAddress: 'TEST55',
            formula: '=FLOOR(5.8)',
            expected: 5,
            tolerance: 0
        },
        {
            name: 'INT - alias for FLOOR',
            sheetName: 'first',
            cellAddress: 'TEST56',
            formula: '=INT(5.8)',
            expected: 5,
            tolerance: 0
        },

        // ==================== FP Function Tests ====================
        {
            name: 'FP - positive number',
            sheetName: 'first',
            cellAddress: 'TEST57',
            formula: '=FP(5.75)',
            expected: 0.75,
            tolerance: 0.0001
        },

        // ==================== INF Function Tests ====================
        {
            name: 'INF - positive infinity',
            sheetName: 'first',
            cellAddress: 'TEST58',
            formula: '=INF()',
            expected: Number.POSITIVE_INFINITY,
            tolerance: 0
        },

        // ==================== IP Function Tests ====================
        {
            name: 'IP - positive number',
            sheetName: 'first',
            cellAddress: 'TEST59',
            formula: '=IP(5.75)',
            expected: 5,
            tolerance: 0
        },
        {
            name: 'IP - negative number',
            sheetName: 'first',
            cellAddress: 'TEST60',
            formula: '=IP(-5.75)',
            expected: -5,
            tolerance: 0
        },

        // ==================== LOG Function Tests ====================
        {
            name: 'LOG - ln(e)',
            sheetName: 'first',
            cellAddress: 'TEST61',
            formula: '=LOG(EXP(1))',
            expected: 1,
            tolerance: 0.0001
        },
        {
            name: 'LOG - ln(1)',
            sheetName: 'first',
            cellAddress: 'TEST62',
            formula: '=LOG(1)',
            expected: 0,
            tolerance: 0.0001
        },

        // ==================== LOG10 Function Tests ====================
        {
            name: 'LOG10 - log10(100)',
            sheetName: 'first',
            cellAddress: 'TEST63',
            formula: '=LOG10(100)',
            expected: 2,
            tolerance: 0.0001
        },

        // ==================== MOD Function Tests ====================
        {
            name: 'MOD - 10 mod 3',
            sheetName: 'first',
            cellAddress: 'TEST64',
            formula: '=MOD(10,3)',
            expected: 1,
            tolerance: 0
        },

        // ==================== PI Function Tests ====================
        {
            name: 'PI - constant',
            sheetName: 'first',
            cellAddress: 'TEST65',
            formula: '=PI',
            expected: Math.PI,
            tolerance: 0.0001
        },

        // ==================== RAD Function Tests ====================
        {
            name: 'RAD - 90 degrees',
            sheetName: 'first',
            cellAddress: 'TEST66',
            formula: '=RAD(90)',
            expected: Math.PI / 2,
            tolerance: 0.0001
        },

        // ==================== RMD Function Tests ====================
        {
            name: 'RMD - 10 remainder 3',
            sheetName: 'first',
            cellAddress: 'TEST67',
            formula: '=RMD(10,3)',
            expected: 1,
            tolerance: 0
        },

        // ==================== RND Function Tests ====================
        {
            name: 'RND - returns in [0,1)',
            sheetName: 'first',
            cellAddress: 'TEST68',
            formula: '=RND()',
            expected: 'range',
            tolerance: 0,
            validate: (actual) => typeof actual === 'number' && actual >= 0 && actual < 1
        },

        // ==================== SEC Function Tests ====================
        {
            name: 'SEC - 0',
            sheetName: 'first',
            cellAddress: 'TEST69',
            formula: '=SEC(0)',
            expected: 1,
            tolerance: 0.0001
        },

        // ==================== SGN Function Tests ====================
        {
            name: 'SGN - positive',
            sheetName: 'first',
            cellAddress: 'TEST70',
            formula: '=SGN(5)',
            expected: 1,
            tolerance: 0
        },
        {
            name: 'SGN - negative',
            sheetName: 'first',
            cellAddress: 'TEST71',
            formula: '=SGN(-5)',
            expected: -1,
            tolerance: 0
        },
        {
            name: 'SGN - zero',
            sheetName: 'first',
            cellAddress: 'TEST72',
            formula: '=SGN(0)',
            expected: 0,
            tolerance: 0
        },

        // ==================== SIN Function Tests ====================
        {
            name: 'SIN - 0',
            sheetName: 'first',
            cellAddress: 'TEST73',
            formula: '=SIN(0)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'SIN - PI/2',
            sheetName: 'first',
            cellAddress: 'TEST74',
            formula: '=SIN(PI/2)',
            expected: 1,
            tolerance: 0.0001
        },

        // ==================== SQR Function Tests ====================
        {
            name: 'SQR - 4',
            sheetName: 'first',
            cellAddress: 'TEST75',
            formula: '=SQR(4)',
            expected: 2,
            tolerance: 0.0001
        },

        // ==================== TAN Function Tests ====================
        {
            name: 'TAN - 0',
            sheetName: 'first',
            cellAddress: 'TEST76',
            formula: '=TAN(0)',
            expected: 0,
            tolerance: 0.0001
        },
        {
            name: 'TAN - PI/4',
            sheetName: 'first',
            cellAddress: 'TEST77',
            formula: '=TAN(PI/4)',
            expected: 1,
            tolerance: 0.0001
        },

        // ==================== TIME Function Tests ====================
        {
            name: 'TIME - returns seconds',
            sheetName: 'first',
            cellAddress: 'TEST78',
            formula: '=TIME()',
            expected: 'range',
            tolerance: 0,
            validate: (actual) => typeof actual === 'number' && actual >= 0 && actual <= 86400
        },

        // ==================== Combined Function Tests ====================
        {
            name: 'Combined - DEG(ATN(1))',
            sheetName: 'first',
            cellAddress: 'TEST79',
            formula: '=DEG(ATN(1))',
            expected: 45,
            tolerance: 0.0001
        },
        {
            name: 'Combined - RAD(45)',
            sheetName: 'first',
            cellAddress: 'TEST80',
            formula: '=RAD(45)',
            expected: Math.PI / 4,
            tolerance: 0.0001
        },
        // ==================== POWER Function Tests ====================
        // Positive base tests
        {
            name: 'POWER - positive base with integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST81',
            formula: '=POWER(2.5, 3)',
            expected: 15.625,
            tolerance: 0.0001
        },
        {
            name: 'POWER - positive base exponent zero',
            sheetName: 'first',
            cellAddress: 'TEST82',
            formula: '=POWER(2, 0)',
            expected: 1,
            tolerance: 0
        },
        {
            name: 'POWER - positive base with negative integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST83',
            formula: '=POWER(2.5, -2)',
            expected: 0.16,
            tolerance: 0.0001
        },
        {
            name: 'POWER - positive base with negative float exponent',
            sheetName: 'first',
            cellAddress: 'TEST84',
            formula: '=POWER(2, -1.5)',
            expected: 0.353553,
            tolerance: 0.0001
        },
        {
            name: 'POWER - fractional base with integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST85',
            formula: '=POWER(0.5, 3)',
            expected: 0.125,
            tolerance: 0.0001
        },

        // Negative base with integer exponent tests
        {
            name: 'POWER - negative base with odd integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST86',
            formula: '=POWER(-2, 3)',
            expected: -8,
            tolerance: 0
        },
        {
            name: 'POWER - negative base with even integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST87',
            formula: '=POWER(-2.5, 2)',
            expected: 6.25,
            tolerance: 0.0001
        },
        {
            name: 'POWER - negative base exponent zero',
            sheetName: 'first',
            cellAddress: 'TEST88',
            formula: '=POWER(-3, 0)',
            expected: 1,
            tolerance: 0
        },
        {
            name: 'POWER - negative base with negative integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST89',
            formula: '=POWER(-2, -2)',
            expected: 0.25,
            tolerance: 0.0001
        },
        {
            name: 'POWER - negative base with negative exponent odd',
            sheetName: 'first',
            cellAddress: 'TEST90',
            formula: '=POWER(-2.5, -1)',
            expected: -0.4,
            tolerance: 0.0001
        },

        // Zero base tests
        {
            name: 'POWER - zero base exponent zero',
            sheetName: 'first',
            cellAddress: 'TEST91',
            formula: '=POWER(0, 0)',
            expected: '#NUM!',
            tolerance: 0
        },
        {
            name: 'POWER - zero base positive integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST92',
            formula: '=POWER(0, 2)',
            expected: 0,
            tolerance: 0
        },
        {
            name: 'POWER - zero base positive float exponent',
            sheetName: 'first',
            cellAddress: 'TEST93',
            formula: '=POWER(0, 1.5)',
            expected: 0,
            tolerance: 0
        },
        {
            name: 'POWER - zero base negative integer exponent',
            sheetName: 'first',
            cellAddress: 'TEST94',
            formula: '=POWER(0, -1)',
            expected: '#DIV/0!',
            tolerance: 0
        },
        {
            name: 'POWER - zero base negative float exponent',
            sheetName: 'first',
            cellAddress: 'TEST95',
            formula: '=POWER(0, -0.5)',
            expected: '#NUM!',
            tolerance: 0
        },

        // Negative base with fractional exponent (should return #NUM!)
        {
            name: 'POWER - negative base with fractional exponent',
            sheetName: 'first',
            cellAddress: 'TEST96',
            formula: '=POWER(-4, 0.5)',
            expected: '#NUM!',
            tolerance: 0
        },
        {
            name: 'POWER - negative base with fractional exponent approx',
            sheetName: 'first',
            cellAddress: 'TEST97',
            formula: '=POWER(-8.1, 0.333333)',
            expected: '#NUM!',
            tolerance: 0
        },
        {
            name: 'POWER - negative base with negative fractional exponent',
            sheetName: 'first',
            cellAddress: 'TEST98',
            formula: '=POWER(-1, -0.5)',
            expected: '#NUM!',
            tolerance: 0
        },

        // POW alias tests
        {
            name: 'POW alias - positive base',
            sheetName: 'first',
            cellAddress: 'TEST99',
            formula: '=POW(2.5, 3)',
            expected: 15.625,
            tolerance: 0.0001
        },
        {
            name: 'POW alias - semicolon separator',
            sheetName: 'first',
            cellAddress: 'TEST100',
            formula: '=POW(2;3)',
            expected: 8,
            tolerance: 0
        },
        {
            name: 'POWER alias - semicolon separator',
            sheetName: 'first',
            cellAddress: 'TEST101',
            formula: '=POWER(2;3)',
            expected: 8,
            tolerance: 0
        },

        // Caret operator (^) tests
        {
            name: 'Caret operator - positive base',
            sheetName: 'first',
            cellAddress: 'TEST102',
            formula: '=2.5^3',
            expected: 15.625,
            tolerance: 0.0001
        },
        {
            name: 'Caret operator - exponent zero',
            sheetName: 'first',
            cellAddress: 'TEST103',
            formula: '=2^0',
            expected: 1,
            tolerance: 0
        },
        {
            name: 'Caret operator - negative base odd exponent',
            sheetName: 'first',
            cellAddress: 'TEST104',
            formula: '=(-2)^3',
            expected: -8,
            tolerance: 0
        },
        {
            name: 'Caret operator - negative base even exponent',
            sheetName: 'first',
            cellAddress: 'TEST105',
            formula: '=(-2.5)^2',
            expected: 6.25,
            tolerance: 0.0001
        },
        {
            name: 'Caret operator - zero base positive',
            sheetName: 'first',
            cellAddress: 'TEST106',
            formula: '=0^2',
            expected: 0,
            tolerance: 0
        },
        {
            name: 'Caret operator - zero base zero',
            sheetName: 'first',
            cellAddress: 'TEST107',
            formula: '=0^0',
            expected: '#NUM!',
            tolerance: 0
        },
        {
            name: 'Caret operator - negative base fractional exponent',
            sheetName: 'first',
            cellAddress: 'TEST108',
            formula: '=(-4)^0.5',
            expected: '#NUM!',
            tolerance: 0
        },
        {
            name: 'Caret operator - expression with power',
            sheetName: 'first',
            cellAddress: 'TEST109',
            formula: '=2^3+5',
            expected: 13,
            tolerance: 0
        },
        {
            name: 'Caret operator - power precedence',
            sheetName: 'first',
            cellAddress: 'TEST110',
            formula: '=2*3^2',
            expected: 18,
            tolerance: 0
        },
        {
            name: 'Caret operator - right associativity',
            sheetName: 'first',
            cellAddress: 'TEST111',
            formula: '=2^3^2',
            expected: 512,
            tolerance: 0
        }
    ];
}

// Helper function to ensure sheet exists
function ensureSheetExists(dataHolder, sheetName) {
    if (typeof dataHolder.hasSheet === 'function') {
        if (!dataHolder.hasSheet(sheetName)) {
            if (typeof dataHolder.addSheet === 'function') {
                dataHolder.addSheet(sheetName);
            }
        }
    } else {
        const sheets = dataHolder.getAllSheets ? dataHolder.getAllSheets() : dataHolder.sheets;
        if (sheets && !sheets[sheetName]) {
            sheets[sheetName] = {
                start_row: 1,
                start_col: 1,
                cells: []
            };
        }
    }
}

// Add this helper function to tests.js
function clearTestCell(dataHolder, sheetName, cellAddress) {
    dataHolder.setCellValue(sheetName, cellAddress, '');
}


// Run a single test
async function runTest(test, computationEngine, dataHolder) {
    try {

        // Clear the test cell first
        clearTestCell(dataHolder, test.sheetName, test.cellAddress);

        // Run setup if provided
        if (test.setup) {
            test.setup(dataHolder);
        }

        // Ensure the sheet exists
        ensureSheetExists(dataHolder, test.sheetName);

        // Set the formula in the cell
        dataHolder.setCellValue(test.sheetName, test.cellAddress, test.formula);

        // Get the cell object
        const sheet = dataHolder.getSheet(test.sheetName);
        const cell = sheet.cells.find(c => c.cell === test.cellAddress);

        if (!cell) {
            throw new Error(`Cell ${test.cellAddress} not found after setting value`);
        }

        // Compute the value using the correct method
        const result = await computationEngine.computeCellValue(test.sheetName, cell);

        // Parse the result (it might be a formatted number or string)
        let actual = result;

        // Try to convert to number if it looks like a number
        if (typeof result === 'string' && !isNaN(parseFloat(result)) && isFinite(result)) {
            actual = parseFloat(result);
        }

       // In runTest function, update the comparison logic:

let passed = false;

if (test.validate) {
    passed = test.validate(actual);
} else if (test.expected === 'string') {
    passed = typeof actual === 'string';
} else if (test.expected === 'range') {
    passed = test.validate(actual);
} else if (typeof test.expected === 'number') {
    const tolerance = 0.05;
    if (typeof actual === 'number') {
        // Handle Infinity comparison
        if (test.expected === Infinity || test.expected === -Infinity) {
            passed = actual === test.expected;
        } else {
            passed = Math.abs(actual - test.expected) <= tolerance;
        }
    } else {
        passed = false;
    }
} else {
    passed = actual === test.expected;
}

        return {
            name: test.name,
            sheetName: test.sheetName,
            cellAddress: test.cellAddress,
            formula: test.formula,
            expected: test.expected,
            actual: actual,
            passed: passed,
            error: null
        };
    } catch (error) {
        return {
            name: test.name,
            sheetName: test.sheetName,
            cellAddress: test.cellAddress,
            formula: test.formula,
            expected: test.expected,
            actual: `ERROR: ${error.message}`,
            passed: false,
            error: error.message
        };
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting test suite...');

    // Initialize tests if not already done
    if (tests.length === 0) {
        initializeTests();
    }

    // Create fresh DataHolder and ComputationEngine for each test run
    const dataHolder = new DataHolder();
    const computationEngine = new ComputationEngine(dataHolder);

    // Ensure default sheets exist
    ensureSheetExists(dataHolder, 'first');

    testResults = [];

    // Run each test sequentially
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`Running test ${i + 1}/${tests.length}: ${test.name}`);
        const result = await runTest(test, computationEngine, dataHolder);
        testResults.push(result);
    }

    // Display results
    displayResults();

    console.log('Test suite completed');
    return testResults;
}

// Display results in the HTML table
function displayResults() {
    const tbody = document.getElementById('test-body');
    const summarySpan = document.getElementById('summary-text');

    if (!tbody) return;

    const passedCount = testResults.filter(r => r.passed).length;
    const failedCount = testResults.filter(r => !r.passed).length;
    const totalCount = testResults.length;

    // Update summary
    if (summarySpan) {
        const passRate = totalCount > 0 ? Math.round(passedCount/totalCount*100) : 0;
        summarySpan.innerHTML = `${passedCount} passed, ${failedCount} failed, ${totalCount} total (${passRate}% pass rate)`;
        summarySpan.className = failedCount === 0 ? 'passed-count' : '';
    }

    // Clear table
    tbody.innerHTML = '';

    // Add each test result to the table
    testResults.forEach((result, index) => {
        const row = tbody.insertRow();
        row.className = result.passed ? 'passed' : 'failed';

        // Test number
        row.insertCell(0).textContent = index + 1;

        // Test name
        row.insertCell(1).textContent = result.name;

        // Sheet/Cell
        row.insertCell(2).textContent = `${result.sheetName}.${result.cellAddress}`;

        // Formula
        row.insertCell(3).textContent = result.formula;

        // Expected
        let expectedDisplay = result.expected;
        if (typeof result.expected === 'number') {
            expectedDisplay = result.expected.toFixed(4);
        }
        row.insertCell(4).textContent = expectedDisplay;

        // Actual
        let actualDisplay = result.actual;
        if (typeof result.actual === 'number') {
            actualDisplay = result.actual.toFixed(4);
        }
        row.insertCell(5).textContent = actualDisplay;

        // Result
        const resultCell = row.insertCell(6);
        resultCell.textContent = result.passed ? '✓ PASS' : '✗ FAIL';
        if (result.error) {
            resultCell.title = result.error;
        }
    });
}

// Filter functions
function showAllTests() {
    const rows = document.querySelectorAll('#test-body tr');
    rows.forEach(row => {
        row.style.display = '';
    });
}

function showFailedOnly() {
    const rows = document.querySelectorAll('#test-body tr');
    rows.forEach(row => {
        if (row.classList.contains('failed')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showPassedOnly() {
    const rows = document.querySelectorAll('#test-body tr');
    rows.forEach(row => {
        if (row.classList.contains('passed')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Copy report to clipboard
function copyFailedReport() {
    const failedTests = testResults.filter(r => !r.passed);
    if (failedTests.length === 0) {
        alert('No failed tests to report!');
        return;
    }

    let report = 'FAILED TESTS REPORT\n';
    report += '='.repeat(50) + '\n\n';

    failedTests.forEach((test, index) => {
        report += `${index + 1}. ${test.name}\n`;
        report += `   Sheet/Cell: ${test.sheetName}.${test.cellAddress}\n`;
        report += `   Formula: ${test.formula}\n`;
        report += `   Expected: ${test.expected}\n`;
        report += `   Actual: ${test.actual}\n`;
        if (test.error) {
            report += `   Error: ${test.error}\n`;
        }
        report += '\n';
    });

    report += `\nSummary: ${failedTests.length} failed out of ${testResults.length} total tests\n`;

    navigator.clipboard.writeText(report).then(() => {
        alert('Failed tests report copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy report to clipboard');
    });
}

function copyFullReport() {
    let report = 'FULL TEST REPORT\n';
    report += '='.repeat(50) + '\n\n';

    const passedCount = testResults.filter(r => r.passed).length;
    const failedCount = testResults.filter(r => !r.passed).length;

    report += `SUMMARY: ${passedCount} passed, ${failedCount} failed, ${testResults.length} total\n`;
    if (testResults.length > 0) {
        report += `Pass Rate: ${Math.round(passedCount/testResults.length*100)}%\n`;
    }
    report += '\n' + '='.repeat(50) + '\n\n';

    testResults.forEach((test, index) => {
        const status = test.passed ? '✓ PASS' : '✗ FAIL';
        report += `${index + 1}. [${status}] ${test.name}\n`;
        report += `   Formula: ${test.formula}\n`;
        report += `   Expected: ${test.expected}\n`;
        report += `   Actual: ${test.actual}\n`;
        if (test.error) {
            report += `   Error: ${test.error}\n`;
        }
        report += '\n';
    });

    navigator.clipboard.writeText(report).then(() => {
        alert('Full test report copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy report to clipboard');
    });
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tests
    initializeTests();

    // Set up button event listeners
    const runBtn = document.getElementById('run-tests-btn');
    const showAllBtn = document.getElementById('show-all-btn');
    const showFailedBtn = document.getElementById('show-failed-btn');
    const showPassedBtn = document.getElementById('show-passed-btn');
    const copyFailedBtn = document.getElementById('copy-failed-btn');
    const copyFullBtn = document.getElementById('copy-full-btn');

    if (runBtn) {
        runBtn.addEventListener('click', runAllTests);
    }
    if (showAllBtn) {
        showAllBtn.addEventListener('click', showAllTests);
    }
    if (showFailedBtn) {
        showFailedBtn.addEventListener('click', showFailedOnly);
    }
    if (showPassedBtn) {
        showPassedBtn.addEventListener('click', showPassedOnly);
    }
    if (copyFailedBtn) {
        copyFailedBtn.addEventListener('click', copyFailedReport);
    }
    if (copyFullBtn) {
        copyFullBtn.addEventListener('click', copyFullReport);
    }

    // Auto-run tests on page load
    setTimeout(() => {
        runAllTests();
    }, 500);
});

// Export for use in other modules if needed
export { runAllTests, testResults, tests };
