# Editable Table Viewport with Formula Support

A JavaScript application that displays an editable spreadsheet-like table with viewport navigation, multiple sheet support, reactive formula computation, main menu, command line interface, context menu, cell tips, advanced selection features, and file operations.

## Screenshots

![UI](https://dl.dropbox.com/scl/fi/ppuzeijjt37vvyxsr54nx/tips.png?rlkey=t05p0zh7zhon2swdbo44j86bx&st=xrofpbil)

![Tests](https://dl.dropbox.com/scl/fi/jzeh2u30dpyiio1wqoa8r/newtests.png?rlkey=a2i1qpk0ko4xw34xir6lxtptn&st=l1seamqp)

![Selections: Parts](https://dl.dropbox.com/scl/fi/k5s9bxiyzbtmcq5t2s86c/selections.png?rlkey=7z0tc7o4ilh6s18tvmtvq51bw&st=6q9akev7)

![Selections: Whole](https://dl.dropbox.com/scl/fi/l5ceytd6r08zfmqmyb0tm/selections_whole.png?rlkey=ey80fwgysiolntu8kcp9hmtk0&st=694o0s5e)

## Features

- **7x7 Viewport:** Displays a fixed 7x7 grid of cells (7 rows × 7 columns)
- **Multiple Sheets:** Supports multiple worksheets with independent data
- **Formula Support:**
  - Basic arithmetic expressions (+, -, *, /)
  - Spreadsheet functions: SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP
  - **Mathematical Functions:** ABS, ACOS, ANGLE, ASIN, ATN, CEIL, COS, COT, CSC, DEG, EXP, FLOOR, FP, INT, IP, LOG, LOG10, MOD, RAD, RMD, RND, SEC, SGN, SIN, SQR, TAN
  - **Utility Functions:** DATE, EPS, INF, PI, TIME
  - Cell references (e.g., `A1`, `B2`, `ZZ14`)
  - Range references (e.g., `A1:C3`)
  - Cross-sheet references (e.g., `first.A1`, `second.B3`)
- **Main Menu Bar:** File, Edit, Selection, Navigation, View, Help menus with keyboard shortcuts
- **Command Line Interface:** Execute commands with history and auto-completion
- **File Operations:** Open/Save `.edt` files, Export to CSV
- **Advanced Selection System:** 
  - Column selection (click column headers)
  - Row selection (click row headers)
  - Individual cell selection (Ctrl+Click)
  - Range selection (Shift+Arrow keys or Shift+Click)
  - Select All (Ctrl+A)
  - Clear selection (Esc)
  - Per-sheet selection persistence
- **Context Menu:** Right-click on any cell for quick actions
- **Cell Tips:** Add, show, hide, edit, and delete sticky notes for any cell
- **Copy/Cut/Paste:** Full clipboard support with metadata preservation
- **Dual Mode Display:**
  - **Formulas Mode:** Shows actual formulas (e.g., `=SUM(A1:A3)`)
  - **Results Mode:** Shows computed values
- **Reactive Computation:** Formulas automatically recalculate when referenced cells change
- **Cell Editing:** Double-click any cell to edit its content
- **Viewport Navigation:** Move the viewport around a virtual grid:
  - Move to top/bottom/left/right edges (Page Up/Down, Home/End)
  - Step up/down/left/right one row/column at a time (Ctrl+Page Up/Down, Ctrl+Home/End)
  - Arrow key navigation with auto-scroll
- **Large Virtual Grid:** Supports up to 999 rows and columns up to ZZZ (18,278 columns)
- **Position & Selection Indicator:** Shows current viewport range, active mode, and selection status

---

## Mathematical Functions Reference

The application includes a comprehensive set of mathematical and trigonometric functions for advanced calculations.

### Absolute Value and Sign Functions

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **ABS** | `=ABS(x)` | Returns the absolute value of x | `=ABS(-5)` | `5` |
| **SGN** | `=SGN(x)` | Returns the sign of x (-1, 0, or 1) | `=SGN(-5)` | `-1` |
| **INT** | `=INT(x)` | Returns the largest integer ≤ x (same as FLOOR) | `=INT(5.8)` | `5` |
| **FLOOR** | `=FLOOR(x)` | Returns the largest integer ≤ x | `=FLOOR(5.8)` | `5` |
| **CEIL** | `=CEIL(x)` | Returns the smallest integer ≥ x | `=CEIL(5.3)` | `6` |
| **IP** | `=IP(x)` | Returns the integer part (truncates toward zero) | `=IP(-5.75)` | `-5` |
| **FP** | `=FP(x)` | Returns the fractional part of x | `=FP(5.75)` | `0.75` |

### Trigonometric Functions (Radians)

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **SIN** | `=SIN(x)` | Returns the sine of x (x in radians) | `=SIN(PI/2)` | `1` |
| **COS** | `=COS(x)` | Returns the cosine of x (x in radians) | `=COS(0)` | `1` |
| **TAN** | `=TAN(x)` | Returns the tangent of x (x in radians) | `=TAN(PI/4)` | `1` |
| **COT** | `=COT(x)` | Returns the cotangent of x | `=COT(PI/4)` | `1` |
| **SEC** | `=SEC(x)` | Returns the secant of x (1/cos(x)) | `=SEC(0)` | `1` |
| **CSC** | `=CSC(x)` | Returns the cosecant of x (1/sin(x)) | `=CSC(PI/2)` | `1` |

### Inverse Trigonometric Functions

| Function | Syntax | Description | Domain | Example | Result |
|----------|--------|-------------|--------|---------|--------|
| **ASIN** | `=ASIN(x)` | Returns the arcsine of x (Quadrants I/IV) | [-1, 1] | `=ASIN(1)` | `π/2` (1.5708) |
| **ACOS** | `=ACOS(x)` | Returns the arccosine of x (Quadrants I/II) | [-1, 1] | `=ACOS(0)` | `π/2` (1.5708) |
| **ATN** | `=ATN(x)` | Returns the arctangent of x (Quadrants I/IV) | All reals | `=ATN(1)` | `π/4` (0.7854) |
| **ANGLE** | `=ANGLE(x, y)` | Returns the angle φ formed by point (x,y) | All reals | `=ANGLE(1,1)` | `π/4` (0.7854) |

**Note:** `ANGLE(x, y)` is equivalent to `ATAN2(y, x)` and returns the angle in radians between the positive x-axis and the point (x, y), ranging from -π to π.

### Exponential and Logarithmic Functions

| Function | Syntax | Description | Domain | Example | Result |
|----------|--------|-------------|--------|---------|--------|
| **EXP** | `=EXP(x)` | Returns e raised to the power x | All reals | `=EXP(1)` | `2.71828` |
| **LOG** | `=LOG(x)` | Returns the natural logarithm of x | x > 0 | `=LOG(EXP(1))` | `1` |
| **LOG10** | `=LOG10(x)` | Returns the base-10 logarithm of x | x > 0 | `=LOG10(100)` | `2` |
| **SQR** | `=SQR(x)` | Returns the positive square root of x | x ≥ 0 | `=SQR(4)` | `2` |

### Angle Conversion Functions

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **DEG** | `=DEG(x)` | Converts radians to degrees | `=DEG(PI)` | `180` |
| **RAD** | `=RAD(x)` | Converts degrees to radians | `=RAD(90)` | `π/2` (1.5708) |

### Arithmetic and Modulo Functions

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **MOD** | `=MOD(x, y)` | Returns x modulo y (x - y * floor(x/y)) | `=MOD(10,3)` | `1` |
| **RMD** | `=RMD(x, y)` | Returns the remainder of x/y (x - y * truncate(x/y)) | `=RMD(10,3)` | `1` |

### Constants and Utility Functions

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **PI** | `=PI` or `=PI()` | Returns the mathematical constant π | `=PI` | `3.141592653589793` |
| **EPS** | `=EPS()` | Returns machine epsilon (smallest representable number) | `=EPS()` | `2.22e-16` |
| **INF** | `=INF()` | Returns positive infinity | `=INF()` | `Infinity` |
| **DATE** | `=DATE()` | Returns current date in dd-mm-yyyy format | `=DATE()` | `06-04-2026` |
| **TIME** | `=TIME()` | Returns seconds since midnight | `=TIME()` | `50742` |
| **RND** | `=RND()` | Returns a pseudo-random number in [0, 1) | `=RND()` | `0.423` |

### Function Usage Examples

```excel
' Trigonometric calculations
=SIN(PI/6)                    ' Returns 0.5
=COS(RAD(60))                 ' Returns 0.5 (cosine of 60 degrees)
=TAN(PI/4)                    ' Returns 1

' Inverse trigonometric functions
=ASIN(0.5)                    ' Returns 0.5236 (30 degrees in radians)
=ACOS(0.5)                    ' Returns 1.0472 (60 degrees in radians)
=ATN(1)                       ' Returns 0.7854 (45 degrees in radians)
=ANGLE(3, 4)                  ' Returns 0.9273 (angle of point (3,4))

' Exponential and logarithmic calculations
=EXP(2)                       ' Returns 7.389 (e²)
=LOG(100)                     ' Returns 4.605 (ln(100))
=LOG10(1000)                  ' Returns 3
=SQR(16)                      ' Returns 4

' Angle conversion
=DEG(PI)                      ' Returns 180
=RAD(180)                     ' Returns 3.14159 (π)

' Integer operations
=INT(7.8)                     ' Returns 7
=CEIL(7.1)                    ' Returns 8
=FP(7.75)                     ' Returns 0.75
=IP(-7.75)                    ' Returns -7

' Modulo and remainder
=MOD(17, 5)                   ' Returns 2
=RMD(17, 5)                   ' Returns 2

' Constants and utilities
=PI * 2                       ' Returns 6.28318 (2π)
=DATE()                       ' Returns current date
=TIME()                       ' Returns seconds since midnight
=RND()                        ' Returns random number between 0 and 1
```

---

## Selection System

... (existing content remains the same) ...

---

## Expressions and Spreadsheet Functions

The Editable Table Viewport supports a powerful formula engine with AST-based computation. Below is comprehensive documentation on supported expressions and functions.

### Basic Arithmetic Expressions

All formulas must start with the `=` character.

| Operation | Syntax | Example | Result |
|-----------|--------|---------|--------|
| Addition | `=value + value` | `=10 + 20` | `30` |
| Subtraction | `=value - value` | `=50 - 25` | `25` |
| Multiplication | `=value * value` | `=5 * 6` | `30` |
| Division | `=value / value` | `=100 / 4` | `25` |
| Combined | `=(value + value) * value` | `=(10 + 20) * 5` | `150` |
| Nested Parentheses | `=((a + b) * c) / d` | `=((10 + 20) * 5) / 2` | `75` |

#### Supported Operands
- **Numbers:** Integers and decimals (e.g., `42`, `3.14`, `10.5`)
- **Cell References:** Single cells (e.g., `A1`, `B2`, `ZZ14`)
- **Cross-Sheet References:** Cells from other sheets (e.g., `first.A1`, `second.B3`)

---

### Spreadsheet Functions

The following built-in functions are available for data computation:

#### SUM
Calculates the sum of all numeric values in a range or list of arguments.

```
=SUM(range)
=SUM(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=SUM(A1:A10)` | Sum of values in range A1 through A10 | Sum of 10 cells |
| `=SUM(A1:C3)` | Sum of values in rectangular range | Sum of 9 cells |
| `=SUM(A1, B2, C3)` | Sum of specific cells | A1 + B2 + C3 |
| `=SUM(first.A2:A4)` | Cross-sheet range sum (shorthand) | Sum from another sheet |

---

#### AVG
Calculates the arithmetic mean (average) of all numeric values in a range.

```
=AVG(range)
=AVG(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=AVG(A1:A5)` | Average of values in range A1 through A5 | Sum / Count |
| `=AVG(C17:E17)` | Average of cells C17, D17, E17 | (C17+D17+E17)/3 |
| `=AVG(first.C17:E17)` | Cross-sheet average (shorthand) | Average from another sheet |

**Note:** Empty cells and non-numeric values are excluded from the calculation.

---

#### MAX
Returns the maximum (largest) numeric value in a range.

```
=MAX(range)
=MAX(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=MAX(A1:A100)` | Maximum value in range A1 through A100 | Highest value |
| `=MAX(C1:C10)` | Maximum of 10 cells | Highest of C1-C10 |
| `=MAX(first.A1, second.B2)` | Maximum across sheets | Larger of two values |

---

#### MIN
Returns the minimum (smallest) numeric value in a range.

```
=MIN(range)
=MIN(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=MIN(D1:D10)` | Minimum value in range D1 through D10 | Lowest value |
| `=MIN(A1:C3)` | Minimum of rectangular range | Lowest of 9 cells |

---

#### COUNT
Counts the number of numeric values in a range.

```
=COUNT(range)
=COUNT(value1, value2, ...)
```

**Examples:**
| Formula | Description | Result |
|---------|-------------|--------|
| `=COUNT(E1:E20)` | Count of numeric values in range | Number of cells with numbers |
| `=COUNT(A1, B2, C3)` | Count of specific cells | 3 (if all numeric) |

---

#### SUMPRODUCT
Multiplies corresponding components in the given arrays and returns the sum of those products.

```
=SUMPRODUCT(range1, range2)
=SUMPRODUCT(range1, range2, range3, ...)
```

**Key Features:**
- Supports 2 or more ranges
- Ranges must have the same dimensions (same number of cells)
- Empty cells are treated as 0
- Non-numeric values are ignored
- Supports cross-sheet references
- Works with single row, single column, and rectangular ranges

**Examples:**

| Formula | Description | Calculation | Result |
|---------|-------------|-------------|--------|
| `=SUMPRODUCT(A1:A3, B1:B3)` | Two vertical ranges | A1×B1 + A2×B2 + A3×B3 | Sum of products |
| `=SUMPRODUCT(A1:C1, A2:C2)` | Two horizontal ranges | A1×A2 + B1×B2 + C1×C2 | Sum of products |
| `=SUMPRODUCT(A1:A2, B1:B2, C1:C2)` | Three ranges | (A1×B1×C1) + (A2×B2×C2) | Sum of triple products |
| `=SUMPRODUCT(first.A1:A3, second.B1:B3)` | Cross-sheet ranges | Multiplies values across sheets | Sum of cross-sheet products |

**Practical Examples:**

```excel
=SUMPRODUCT(A1:A5, B1:B5)           ' Weighted sum: quantity × price
=SUMPRODUCT(A1:A3, B1:B3, C1:C3)    ' Volume calculation: length × width × height
=SUMPRODUCT((A1:A10>10), B1:B10)    ' Conditional sum (Boolean logic)
```

**Use Cases:**
- **Weighted Averages:** `=SUMPRODUCT(weights, values) / SUM(weights)`
- **Dot Product:** Calculate vector dot product of two ranges
- **Conditional Sums:** Combine with Boolean expressions
- **Cross-Sheet Analysis:** Aggregate data from multiple worksheets
- **Multi-dimensional Calculations:** Multiply three or more ranges for volume/area calculations

---

#### VLOOKUP
Looks up a value in the first column of a table and returns a value in the same row from a specified column.

```
=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `lookup_value` | The value to search for in the first column of the table | Yes |
| `table_array` | The range of cells that contains the lookup table | Yes |
| `col_index_num` | The column number in the table from which to return a value (1-indexed) | Yes |
| `range_lookup` | Optional. TRUE = approximate match (default), FALSE = exact match | No |

**Key Features:**
- **Exact Match (FALSE/0):** Finds exact match, returns #N/A if not found
- **Approximate Match (TRUE/1):** Finds closest match (requires first column sorted ascending)
- **Cross-Sheet Support:** Can reference tables from other sheets
- **Case-Insensitive:** String matching is case-insensitive
- **Type Handling:** Properly handles numbers, strings, and mixed types

**Examples:**

| Formula | Description | Result |
|---------|-------------|--------|
| `=VLOOKUP("Product B", A1:B3, 2, FALSE)` | Exact match for Product B | Returns 200 |
| `=VLOOKUP(85, A1:B6, 2, TRUE)` | Approximate match for grade | Returns "B" |
| `=VLOOKUP(A1, prices.A1:B100, 2, FALSE)` | Cross-sheet exact lookup | Returns price |

**Error Messages:**

| Error | Cause |
|-------|-------|
| `#ERROR: VLOOKUP requires at least 3 arguments` | Missing required arguments |
| `#ERROR: Invalid column index number` | Column index < 1 or not a number |
| `#ERROR: Invalid table range` | Table array is not a valid range |
| `#ERROR: Column index exceeds table width` | Column number > table columns |
| `#N/A` | No exact match found |

---

### Cell References

#### Single Cell Reference
Reference a specific cell by its column letter and row number.

```
=A1        // Column A, Row 1
=B2        // Column B, Row 2
=ZZ14      // Column ZZ, Row 14
```

#### Range Reference
Reference a rectangular range of cells using the colon (`:`) separator.

```
=A1:C3     // From A1 to C3 (9 cells total)
=A1:A10    // Column A, rows 1 through 10
=B5:Z5     // Row 5, columns B through Z
```

---

### Cross-Sheet References

Reference cells from other worksheets using the `sheetname.cell` format.

#### Single Cell Cross-Sheet
```
=first.A1           // Value from sheet "first", cell A1
=second.B3 + 100    // Value from sheet "second" plus 100
```

#### Range Cross-Sheet (Shorthand)
```
=SUM(first.A2:A4)           // Sum range in "first" sheet (end cell same sheet)
=AVG(first.C17:E17)         // Average range in "first" sheet (shorthand)
=SUMPRODUCT(first.A1:A5, second.B1:B5)  // SUMPRODUCT across sheets
=VLOOKUP(A1, prices.A1:B100, 2, FALSE)  // VLOOKUP across sheets
```

**Note:** Cross-sheet ranges support shorthand notation where the sheet name only needs to be specified before the start cell (e.g., `first.A2:A4`).

---

## Architecture

... (existing content remains the same) ...

---

## Spreadsheet Functions (`/functions`)

| File | Function | Description |
|------|----------|-------------|
| `sum.js` | SUM | Sums all numeric values |
| `avg.js` | AVG | Calculates arithmetic mean |
| `max.js` | MAX | Returns maximum value |
| `min.js` | MIN | Returns minimum value |
| `count.js` | COUNT | Counts numeric values |
| `sumproduct.js` | SUMPRODUCT | Multiplies and sums products |
| `vlookup.js` | VLOOKUP | Looks up values in a table |
| `abs.js` | ABS | Returns absolute value |
| `acos.js` | ACOS | Returns arccosine |
| `angle.js` | ANGLE | Returns angle of point (x,y) |
| `asin.js` | ASIN | Returns arcsine |
| `atn.js` | ATN | Returns arctangent |
| `ceil.js` | CEIL | Returns smallest integer ≥ x |
| `cos.js` | COS | Returns cosine |
| `cot.js` | COT | Returns cotangent |
| `csc.js` | CSC | Returns cosecant |
| `date.js` | DATE | Returns current date |
| `deg.js` | DEG | Converts radians to degrees |
| `eps.js` | EPS | Returns machine epsilon |
| `exp.js` | EXP | Returns e^x |
| `floor.js` | FLOOR/INT | Returns largest integer ≤ x |
| `fp.js` | FP | Returns fractional part |
| `inf.js` | INF | Returns positive infinity |
| `ip.js` | IP | Returns integer part (truncate) |
| `log.js` | LOG | Returns natural logarithm |
| `log10.js` | LOG10 | Returns base-10 logarithm |
| `mod.js` | MOD | Returns modulo |
| `pi.js` | PI | Returns π constant |
| `rad.js` | RAD | Converts degrees to radians |
| `rmd.js` | RMD | Returns remainder |
| `rnd.js` | RND | Returns random number |
| `sec.js` | SEC | Returns secant |
| `sgn.js` | SGN | Returns sign (-1, 0, 1) |
| `sin.js` | SIN | Returns sine |
| `sqr.js` | SQR | Returns square root |
| `tan.js` | TAN | Returns tangent |
| `time.js` | TIME | Returns seconds since midnight |

---

## File Structure

... (existing content remains the same, add new function files to the list) ...

```
├── functions/            # Spreadsheet function implementations
│   ├── sum.js
│   ├── avg.js
│   ├── max.js
│   ├── min.js
│   ├── count.js
│   ├── sumproduct.js
│   ├── vlookup.js
│   ├── abs.js
│   ├── acos.js
│   ├── angle.js
│   ├── asin.js
│   ├── atn.js
│   ├── ceil.js
│   ├── cos.js
│   ├── cot.js
│   ├── csc.js
│   ├── date.js
│   ├── deg.js
│   ├── eps.js
│   ├── exp.js
│   ├── floor.js
│   ├── fp.js
│   ├── inf.js
│   ├── ip.js
│   ├── log.js
│   ├── log10.js
│   ├── mod.js
│   ├── pi.js
│   ├── rad.js
│   ├── rmd.js
│   ├── rnd.js
│   ├── sec.js
│   ├── sgn.js
│   ├── sin.js
│   ├── sqr.js
│   ├── tan.js
│   └── time.js
```

---

## Testing

The application includes a comprehensive test suite (`test.html`) that validates all formula functionality:

- **80+ Test Cases** covering arithmetic, cell references, functions, cross-sheet references, SUMPRODUCT, VLOOKUP, and all mathematical functions
- **100% Pass Rate** on all test cases
- **Visual Test Results** with green/red highlighting for pass/fail indicators
- **Report Generation** for failed tests with copy to clipboard functionality
- **Filtering** options (show all, passed only, failed only)

Run `test.html` from the HTTP server to validate the formula engine.

---

## Version History

### v1.7.0 (Current)
- Added 30+ mathematical and utility functions
- Added trigonometric functions: SIN, COS, TAN, COT, SEC, CSC
- Added inverse trigonometric functions: ASIN, ACOS, ATN, ANGLE (ATAN2)
- Added exponential and logarithmic functions: EXP, LOG, LOG10, SQR
- Added integer functions: INT, FLOOR, CEIL, IP, FP
- Added modulo functions: MOD, RMD
- Added constants and utilities: PI, EPS, INF, DATE, TIME, RND
- Added angle conversion functions: DEG, RAD
- Added sign and absolute value functions: ABS, SGN
- Enhanced cross-sheet range support with shorthand notation
- Achieved 100% test pass rate with 80+ test cases
- Added comprehensive mathematical function documentation

### v1.6.0
- Added comprehensive selection system
- Added column selection (click column headers)
- Added row selection (click row headers)
- Added individual cell selection (Ctrl+Click)
- Added range selection (Shift+Arrow keys or Shift+Click)
- Added Select All (Ctrl+A) with visual feedback
- Added Clear Selection (Esc)
- Added per-sheet selection persistence
- Added selection status display
- Added Selection menu in main menu bar
- Added MoveFocus actions for keyboard navigation
- Added SelectAllCellsAction
- Improved viewport auto-scroll during selection
- Enhanced visual feedback with color-coded selections

### v1.5.0
- Added Context Menu (right-click) with dynamic Tip management
- Added Cell Tips feature with full CRUD operations
- Added Copy, Cut, Paste functionality with metadata preservation
- Added dynamic menu items based on tip state (Show/Hide toggle)
- Added tip indicator (💡) on cells with tips
- Added tip repositioning on scroll/resize
- Added metadata persistence for tips in save/load
- Added close button on tips to hide them

### v1.4.0
- Added Main Menu bar with File, Edit, View, Help menus
- Added Command Line Interface with command history
- Added File operations: Open/Save `.edt` files, Export to CSV
- Added Navigation actions as modular components
- Added keyboard shortcuts for all major operations
- Added modal dialogs for About and Keyboard Shortcuts
- Refactored styles into separate CSS files

### v1.3.0
- Refactored codebase into modular architecture with separate class files
- Added dynamic class loading system
- Added VLOOKUP function with exact and approximate match support

### v1.2.0
- Added SUMPRODUCT function with support for 2+ ranges
- Enhanced cross-sheet reference support

### v1.1.0
- Added cross-sheet reference support
- Implemented range references for all functions

### v1.0.0
- Initial release with basic arithmetic and spreadsheet functions
- Viewport navigation and multiple sheet support
- Dual mode display (formulas/results)
