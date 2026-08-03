# Triangle Solver CLI

A small TypeScript command-line tool for solving common triangle problems.

## Supported cases

- SSS: three side lengths
- SAS: two side lengths and the included angle
- ASA/AAS: one side length and two angles
- Right triangles: two side lengths or one acute angle plus one side

Version 1 intentionally rejects ambiguous SSA input.

## Setup

```bash
npm install
```

## Usage

```bash
npm start -- --a 3 --b 4 --c 5
npm start -- --a 7 --b 10 --angleC 30
npm start -- --c 8 --angleA 50 --angleB 60
npm start -- --right --a 3 --b 4
npm start -- --interactive
```

## Output

The CLI prints:

- the solved case
- side lengths `a`, `b`, and `c`
- angles `A`, `B`, and `C` in degrees
- perimeter
- area
- notes for special handling such as right-triangle mode

In right-triangle mode, side `c` is treated as the hypotenuse.