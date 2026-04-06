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
  - Basic arithmetic expressions (+, -, *, /, ^)
  - Spreadsheet functions: SUM, AVG, MAX, MIN, COUNT, SUMPRODUCT, VLOOKUP
  - **Mathematical Functions:** ABS, ACOS, ANGLE, ASIN, ATN, CEIL, COS, COT, CSC, DEG, EXP, FLOOR, FP, INT, IP, LOG, LOG10, MOD, POWER, POW, RAD, RMD, RND, SEC, SGN, SIN, SQR, TAN
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

### Power and Exponentiation Functions

| Function | Syntax | Description | Example | Result |
|----------|--------|-------------|---------|--------|
| **POWER** | `=POWER(base, exponent)` | Returns base raised to the power exponent | `=POWER(2.5, 3)` | `15.625` |
| **POW** | `=POW(base, exponent)` | Alias for POWER function | `=POW(2, 3)` | `8` |
| **^ operator** | `=base ^ exponent` | Exponentiation operator | `=2.5 ^ 3` | `15.625` |

**Note:** The POWER function (and its POW alias) support both comma (`,`) and semicolon (`;`) as argument separators. The caret operator (`^`) provides a convenient shorthand for exponentiation.

#### Exponentiation Rules and Edge Cases

| Case | Example | Result | Explanation |
|------|---------|--------|-------------|
| Positive base | `=POWER(2.5, 3)` | `15.625` | Standard exponentiation |
| Exponent zero | `=POWER(2, 0)` | `1` | Any number ^ 0 = 1 |
| Negative exponent (integer) | `=POWER(2.5, -2)` | `0.16` | 1 / (2.5²) |
| Negative exponent (float) | `=POWER(2, -1.5)` | `0.353553` | 1 / (2^1.5) |
| Fractional base | `=POWER(0.5, 3)` | `0.125` | 0.5³ |
| Negative base, odd exponent | `=POWER(-2, 3)` | `-8` | (-2)³ |
| Negative base, even exponent | `=POWER(-2.5, 2)` | `6.25` | (-2.5)² |
| Zero base, positive exponent | `=POWER(0, 2)` | `0` | 0² |
| Zero base, exponent zero | `=POWER(0, 0)` | `#NUM!` | Undefined |
| Zero base, negative integer | `=POWER(0, -1)` | `#DIV/0!` | Division by zero |
| Zero base, negative float | `=POWER(0, -0.5)` | `#NUM!` | 1/√0 (undefined) |
| Negative base, fractional exponent | `=POWER(-4, 0.5)` | `#NUM!` | √(-4) (complex) |

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
' Power and exponentiation examples
=POWER(2.5, 3)                ' Returns 15.625
=POW(2, 3)                    ' Returns 8 (alias)
=2.5 ^ 3                      ' Returns 15.625 (caret operator)
=2 ^ 0                        ' Returns 1
=2 ^ -2                       ' Returns 0.25
=0 ^ 2                        ' Returns 0
=0 ^ 0                        ' Returns #NUM! (undefined)
=0 ^ -1                       ' Returns #DIV/0!
=(-2) ^ 3                     ' Returns -8
=(-2.5) ^ 2                   ' Returns 6.25
=(-4) ^ 0.5                   ' Returns #NUM! (complex number)

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

The application features a comprehensive selection system that allows you to select cells, rows, columns, and ranges with visual feedback.

### Selection Methods

| Method | Action | Description |
|--------|--------|-------------|
| **Click column header** | Select entire column | Click on any column letter (A, B, C, etc.) |
| **Click row header** | Select entire row | Click on any row number (1, 2, 3, etc.) |
| **Ctrl+Click on cell** | Toggle cell selection | Add or remove individual cell from selection |
| **Shift+Click on cell** | Range selection | Select range from current focus to clicked cell |
| **Shift+Arrow keys** | Extend range | Expand selection from current focus |
| **Ctrl+A** | Select all | Select all cells in the entire sheet |
| **Esc** | Clear selection | Remove all current selections |

### Selection Visual Feedback

| Selection Type | Color | Description |
|----------------|-------|-------------|
| Column selection | Blue background | Entire column highlighted |
| Row selection | Red background | Entire row highlighted |
| Individual cell | Green background | Selected cells highlighted |
| Range selection | Purple background | Rectangular range highlighted |
| Select All | Light green background | All visible cells highlighted |
| Focus cell | Green thick border | Current active cell indicator |

### Selection Status Display

A selection status bar at the top of the application shows:
- **"All Cells Selected"** when entire sheet is selected
- **Column names** when columns are selected
- **Row numbers** when rows are selected
- **Range addresses** (e.g., `A1:C3`) when ranges are selected
- **Cell addresses** when individual cells are selected

### Selection Persistence

- Selections are saved per sheet (each sheet maintains its own selection state)
- Selections are preserved when switching between sheets
- Selections are saved to `.edt` files and restored on open
- Focus cell position is saved and restored

### Keyboard Navigation with Selection

| Key Combination | Action |
|-----------------|--------|
| `↑` `↓` `←` `→` | Move focus (auto-scrolls viewport) |
| `Shift` + `↑` `↓` `←` `→` | Extend range selection |
| `Page Up` | Move to top edge |
| `Page Down` | Move to bottom edge |
| `Home` | Move to left edge |
| `End` | Move to right edge |
| `Ctrl+Page Up` | Step up one row |
| `Ctrl+Page Down` | Step down one row |
| `Ctrl+Home` | Step left one column |
| `Ctrl+End` | Step right one column |

---

## Context Menu (Right-Click)

Right-click on any cell to open a context menu with the following options:

### Edit Submenu

| Menu Item | Keyboard Shortcut | Description |
|-----------|-------------------|-------------|
| Copy | `Ctrl+C` | Copy cell content to clipboard |
| Cut | `Ctrl+X` | Cut cell content to clipboard and clear the cell |
| Paste | `Ctrl+V` | Paste clipboard content to selected cell |

### Tips Submenu

The Tips submenu is dynamic and changes based on the cell's tip state:

| Cell State | Menu Items |
|------------|-------------|
| No tip exists | Add Tip |
| Tip exists and visible | Hide Tip, Edit Tip, Delete Tip |
| Tip exists and hidden | Show Tip, Edit Tip, Delete Tip |

#### Tip Operations

| Operation | Description |
|-----------|-------------|
| **Add Tip** | Adds a yellow sticky note to the cell with custom text |
| **Show Tip** | Displays a hidden tip |
| **Hide Tip** | Hides a visible tip (preserves content) |
| **Edit Tip** | Modifies the tip text |
| **Delete Tip** | Permanently removes the tip |

**Tip Features:**
- Yellow background with light bulb icon (💡)
- Rounded corners with arrow pointing to cell
- Close button to dismiss
- Auto-positioning (above cell by default, below if not enough space)
- Persists across sheet switches and saves
- Visual indicator (💡) in top-right corner of cells with tips

---

## Main Menu

The application features a comprehensive main menu bar with the following menus and items:

### File Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Open .edt | Open file dialog | `Ctrl+O` | Open a previously saved `.edt` spreadsheet file |
| Save .edt | Save current data | `Ctrl+S` | Save all sheets data to an `.edt` file |
| Export to CSV | Export current sheet | `Ctrl+E` | Export the current sheet to CSV format |

### Edit Menu

| Menu Item | Action | Description |
|-----------|--------|-------------|
| Formulas Mode | Switch to formulas view | Display cell formulas instead of computed values |
| Results Mode | Switch to results view | Display computed values instead of formulas |

### Selection Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Select All | Select entire sheet | `Ctrl+A` | Select all cells in the spreadsheet |
| Clear Selection | Remove all selections | `Esc` | Clear all current selections |

### Navigation Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Move to Top | Go to top edge | `Page Up` | Move viewport to the top of the sheet |
| Move to Bottom | Go to bottom edge | `Page Down` | Move viewport to the bottom of the sheet |
| Move to Left Edge | Go to left edge | `Home` | Move viewport to the left edge |
| Move to Right Edge | Go to right edge | `End` | Move viewport to the right edge |
| Step Up | Move up one row | `Ctrl+Page Up` | Move viewport up one row |
| Step Down | Move down one row | `Ctrl+Page Down` | Move viewport down one row |
| Step Left | Move left one column | `Ctrl+Home` | Move viewport left one column |
| Step Right | Move right one column | `Ctrl+End` | Move viewport right one column |

### View Menu

| Menu Item | Action | Keyboard Shortcut | Description |
|-----------|--------|-------------------|-------------|
| Refresh | Refresh the view | `F5` | Refresh the current view and recalculate all formulas |

### Help Menu

| Menu Item | Action | Description |
|-----------|--------|-------------|
| About | Show about dialog | Display application information and version |
| Keyboard Shortcuts | Show shortcuts dialog | Display all available keyboard shortcuts |

---

## Command Line Interface

The command line interface provides a developer-friendly way to control the spreadsheet. Press `Ctrl+`` (backtick) to focus the command input.

### Available Commands

#### File Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `open` | `open` | Open an `.edt` file |
| `save` | `save [filename]` | Save spreadsheet to `.edt` file |
| `export` | `export [filename]` | Export current sheet to CSV |

#### View Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `formulas` | `formulas` | Switch to Formulas Mode |
| `results` | `results` | Switch to Results Mode |
| `refresh` | `refresh` | Refresh the current view |

#### Navigation Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `goto` | `goto <cell>` | Move viewport to specific cell (e.g., `goto A1`) |
| `sheet` | `sheet <sheetname>` | Switch to a different sheet |

#### Info Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `ls` | `ls` | List all available sheets |
| `info` | `info` | Show current spreadsheet information |
| `help` | `help [command]` | Show available commands or help for specific command |

#### System Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `clear` | `clear` | Clear the command line output |
| `history` | `history` | Show command history |
| `exit` | `exit` | Close the command line interface |

### Command Line Features

- **Command History:** Use `↑` and `↓` arrow keys to navigate through command history
- **Output Coloring:** Different message types have distinct colors:
  - `info` - Blue
  - `success` - Green
  - `error` - Red
  - `warning` - Orange
- **Collapsible Output:** Click the header to minimize/hide command history
- **Keyboard Shortcut:** `Ctrl+`` (backtick) to focus the command input
- **Clear Output:** Use the `⌧` button or `clear` command

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open .edt file |
| `Ctrl+S` | Save .edt file |
| `Ctrl+E` | Export to CSV |

### Edit Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Copy selected cell |
| `Ctrl+X` | Cut selected cell |
| `Ctrl+V` | Paste to selected cell |
| `Double-click` | Edit cell content |

### Selection Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all cells |
| `Esc` | Clear all selections |
| `Shift+Click` | Range selection |
| `Ctrl+Click` | Toggle cell selection |

### Navigation

| Shortcut | Action |
|----------|--------|
| `↑` `↓` `←` `→` | Move focus (auto-scroll) |
| `Shift` + `↑` `↓` `←` `→` | Extend range selection |
| `Page Up` | Move to top edge |
| `Page Down` | Move to bottom edge |
| `Home` | Move to left edge |
| `End` | Move to right edge |
| `Ctrl+Page Up` | Step up one row |
| `Ctrl+Page Down` | Step down one row |
| `Ctrl+Home` | Step left one column |
| `Ctrl+End` | Step right one column |

### System

| Shortcut | Action |
|----------|--------|
| `F5` | Refresh view |
| `Ctrl+`` ` | Toggle command line |

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
| Exponentiation | `=base ^ exponent` | `=2.5 ^ 3` | `15.625` |
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

#### POWER / POW
Raises a number to a specified power.

```
=POWER(base, exponent)
=POW(base, exponent)
=base ^ exponent
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `base` | The base number | Yes |
| `exponent` | The exponent to raise the base to | Yes |

**Key Features:**
- Supports both comma (`,`) and semicolon (`;`) as argument separators
- Handles positive and negative bases
- Handles integer and floating-point exponents
- Follows Excel behavior for edge cases

**Examples:**

| Formula | Description | Result |
|---------|-------------|--------|
| `=POWER(2.5, 3)` | 2.5 raised to the 3rd power | 15.625 |
| `=POW(2, 3)` | 2 raised to the 3rd power (alias) | 8 |
| `=2 ^ 3` | Caret operator shorthand | 8 |
| `=POWER(2, -2)` | 2 raised to the -2nd power | 0.25 |
| `=POWER(0, 5)` | Zero raised to positive power | 0 |
| `=POWER(-2, 3)` | Negative base with odd exponent | -8 |
| `=POWER(-2.5, 2)` | Negative base with even exponent | 6.25 |

**Error Messages:**

| Error | Cause |
|-------|-------|
| `#NUM!` | 0^0 (undefined) or negative base with fractional exponent |
| `#DIV/0!` | 0 raised to a negative integer exponent |

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

The application follows a clean modular MVC-like architecture with separate concerns. The codebase is organized into several directories:

### Core Components (`/classes`)

| Class | Description |
|-------|-------------|
| `ASTNode` | Represents nodes in the Abstract Syntax Tree |
| `ASTEvaluator` | Evaluates AST nodes and handles cell references |
| `ComputationEngine` | Main entry point for formula computation |
| `DataHolder` | Stores all sheet data and provides CRUD operations |
| `FunctionRegistry` | Dynamically loads spreadsheet functions |
| `SimpleFormulaParser` | Parses formula strings directly into AST nodes |
| `ViewModel` | Provides computed properties for view state |
| `SheetView` | Renders the 7x7 viewport as an HTML table |
| `NavButtonsController` | Handles viewport navigation |
| `CellsEditablesController` | Manages cell edit events |
| `AppController` | Orchestrates all components |
| `MainMenu` | Creates and manages the main menu bar |
| `CommandLine` | Provides command line interface |
| `UITip` | Manages cell tip display |
| `PopupContextMenu` | Handles right-click context menu |
| `SelectionDataHolder` | Stores selection data per sheet |
| `SelectionViewDrawer` | Applies selection styles to cells |
| `SelectionManager` | Manages selection events and state |

### Actions (`/actions`)

| Action | Description |
|--------|-------------|
| `OpenAction` | Open .edt JSON files |
| `SaveAction` | Save spreadsheet as .edt |
| `ExportCSVAction` | Export current sheet to CSV |
| `ActionMoveToTop/Bottom/Left/Right` | Edge navigation actions |
| `ActionStepUp/Down/Left/Right` | Step navigation actions |
| `MoveFocusUp/Down/Left/RightAction` | Focus movement actions |
| `SelectAllCellsAction` | Select all cells action |
| `ActionCopy` | Copy cell content to clipboard |
| `ActionCut` | Cut cell content to clipboard |
| `ActionPaste` | Paste clipboard content to cell |
| `ActionAddTip` | Add a tip to a cell |
| `ActionShowTip` | Show a hidden tip |
| `ActionHideTip` | Hide a visible tip |
| `ActionEditTip` | Edit tip text |
| `ActionDeleteTip` | Delete tip from cell |

### Spreadsheet Functions (`/functions`)

| File | Function | Description |
|------|----------|-------------|
| `abs.js` | ABS | Returns absolute value |
| `acos.js` | ACOS | Returns arccosine |
| `angle.js` | ANGLE | Returns angle of point (x,y) |
| `asin.js` | ASIN | Returns arcsine |
| `atn.js` | ATN | Returns arctangent |
| `avg.js` | AVG | Calculates arithmetic mean |
| `ceil.js` | CEIL | Returns smallest integer ≥ x |
| `cos.js` | COS | Returns cosine |
| `cot.js` | COT | Returns cotangent |
| `count.js` | COUNT | Counts numeric values |
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
| `max.js` | MAX | Returns maximum value |
| `min.js` | MIN | Returns minimum value |
| `mod.js` | MOD | Returns modulo |
| `pi.js` | PI | Returns π constant |
| `power.js` | POWER/POW | Raises number to a power |
| `rad.js` | RAD | Converts degrees to radians |
| `rmd.js` | RMD | Returns remainder |
| `rnd.js` | RND | Returns random number |
| `sec.js` | SEC | Returns secant |
| `sgn.js` | SGN | Returns sign (-1, 0, 1) |
| `sin.js` | SIN | Returns sine |
| `sqr.js` | SQR | Returns square root |
| `sum.js` | SUM | Sums all numeric values |
| `sumproduct.js` | SUMPRODUCT | Multiplies and sums products |
| `tan.js` | TAN | Returns tangent |
| `time.js` | TIME | Returns seconds since midnight |
| `vlookup.js` | VLOOKUP | Looks up values in a table |

---

## File Structure

```
.
├── actions
│   ├── ActionAddTip.js
│   ├── ActionCopy.js
│   ├── ActionCut.js
│   ├── ActionDeleteTip.js
│   ├── ActionEditTip.js
│   ├── ActionHideTip.js
│   ├── ActionMoveToBottom.js
│   ├── ActionMoveToLeft.js
│   ├── ActionMoveToRight.js
│   ├── ActionMoveToTop.js
│   ├── ActionPaste.js
│   ├── ActionShowTip.js
│   ├── ActionStepDown.js
│   ├── ActionStepLeft.js
│   ├── ActionStepRight.js
│   ├── ActionStepUp.js
│   ├── ExportCSVAction.js
│   ├── MoveFocusDownAction.js
│   ├── MoveFocusLeftAction.js
│   ├── MoveFocusRightAction.js
│   ├── MoveFocusUpAction.js
│   ├── OpenAction.js
│   ├── SaveAction.js
│   └── SelectAllCellsAction.js
├── classes
│   ├── AppController.js
│   ├── ASTEvaluator.js
│   ├── ASTNode.js
│   ├── CellsEditablesController.js
│   ├── CommandLine.js
│   ├── ComputationEngine.js
│   ├── DataHolder.js
│   ├── FormulaTokenizer.js
│   ├── FunctionRegistry.js
│   ├── MainMenu.js
│   ├── NavButtonsController.js
│   ├── PopupContextMenu.js
│   ├── SelectionDataHolder.js
│   ├── SelectionManager.js
│   ├── SelectionViewDrawer.js
│   ├── SheetView.js
│   ├── SimpleFormulaParser.js
│   ├── UITip.js
│   └── ViewModel.js
├── commandline.css
├── edt.css
├── edt.html
├── edt.js
├── functions
│   ├── abs.js
│   ├── acos.js
│   ├── angle.js
│   ├── asin.js
│   ├── atn.js
│   ├── avg.js
│   ├── ceil.js
│   ├── cos.js
│   ├── cot.js
│   ├── count.js
│   ├── csc.js
│   ├── date.js
│   ├── deg.js
│   ├── eps.js
│   ├── exp.js
│   ├── floor.js
│   ├── fp.js
│   ├── inf.js
│   ├── ip.js
│   ├── log10.js
│   ├── log.js
│   ├── max.js
│   ├── min.js
│   ├── mod.js
│   ├── pi.js
│   ├── power.js
│   ├── rad.js
│   ├── rmd.js
│   ├── rnd.js
│   ├── sec.js
│   ├── sgn.js
│   ├── sin.js
│   ├── sqr.js
│   ├── sum.js
│   ├── sumproduct.js
│   ├── tan.js
│   ├── time.js
│   └── vlookup.js
├── LICENSE
├── mainmenu.css
├── README.md
├── test.html
└── testing
    ├── tests.css
    └── tests.js
```

## Testing

The application includes a comprehensive test suite (`test.html`) that validates all formula functionality:

- **111+ Test Cases** covering arithmetic, cell references, functions, cross-sheet references, SUMPRODUCT, VLOOKUP, all mathematical functions, and exponentiation (POWER, POW, ^ operator)
- **100% Pass Rate** on all test cases
- **Visual Test Results** with green/red highlighting for pass/fail indicators
- **Report Generation** for failed tests with copy to clipboard functionality
- **Filtering** options (show all, passed only, failed only)

Run `test.html` from the HTTP server to validate the formula engine.

---

## Version History

### v1.8.0 (Current)
- Added POWER and POW functions for exponentiation
- Added caret operator (`^`) for inline exponentiation
- Support for both comma (`,`) and semicolon (`;`) as argument separators in functions
- Comprehensive edge case handling for exponentiation (0^0, negative bases with fractional exponents)
- Added 31 new test cases for POWER, POW, and caret operator
- Achieved 111 total test cases with 100% pass rate

### v1.7.0
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
