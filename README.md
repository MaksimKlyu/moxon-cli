# moxon-cli (whynotlayers)

Simple CLI helper to calculate basic dimensions of a Moxon antenna.

> NOTE: The coefficients used in `calcMoxon` are based on reference values
> for 868 MHz frequency with 1.5mm wire diameter. To get accurate results,
> make sure you use the correct formulas/coefficients from trusted sources

## Requirements

- Node.js (v14+ recommended)

## Installation

In the project directory:

```bash
npm install
```

This will install the `readline-sync` dependency used for CLI input.

## Usage

Run the CLI from the project root:

```bash
node index.js
```

You will be prompted to enter:

1. **Frequency, MHz** – operating frequency of the antenna.
2. **Conductor diameter format**:
   - `1` – millimeters (mm)
   - `2` – inches (in)
   - `3` – AWG
3. Depending on the choice above, you enter either diameter in mm, in inches,
   or AWG number.
4. **Output units**:
   - `1` – millimeters (mm) **[default]**
   - `2` – inches (in)

If you simply press Enter at the output units prompt, millimeters (metric
system) will be used by default.

The script prints the Moxon antenna dimensions (A, B, C, D, E) in the chosen
unit system, **total wire length** required to build the antenna, and estimates
the feedpoint impedance.

### Example 

```text
=========================================
MOXON ANTENNA DIMENSIONS
Frequency: 868 MHz
Wire Diameter: 1.500 mm
Wire Cross-section: 1.767 mm²
=========================================
A: 124.00 mm
B: 8.50 mm
C: 18.00 mm (Gap)
D: 19.50 mm
E: 46.00 mm
-----------------------------------------
Total Wire Length: 304.00 mm
Estimated Impedance: ~50.0 Ohm
=========================================
```

### Total Wire Length Calculation

The total wire length is calculated as the sum of all antenna element lengths:
- **Driven element** (U-shape): `A + 2×B`
- **Reflector** (rectangular loop): `A + 2×D`
- **Total**: `2×A + 2×B + 2×D`

Note: E = B + C + D (total vertical height), so E is not used directly in the calculation.

This value helps determine the required amount of wire needed to build the antenna.

### Moxon Antenna Diagram

```text
     ______________________________o  o_____________________________ 
^   |                            Feedpoint                          |
.   | Driven Element                                                B
.   |                                                               |
.                                
E                                                                   C (Gap)
.   
.   |                                                               |
.   |Reflector                                                      D
.   |                                                               |
v   |_______________________________A_______________________________|
    
```

## Customization

- To change the reference geometry or coefficients, edit `calcMoxon` in
  `index.js`.
- If you have a precise AWG-to-mm table or formula, replace the implementation
  of `awgToMm`.
