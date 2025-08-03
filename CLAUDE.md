# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a schematic generator tool that creates right-facing electronic schematic patterns with automatic layout. The core concept is generating every possible schematic by connecting chip pins to pre-defined "small patterns" (like resistors to ground, voltage dividers, etc.).

## Development Commands

- **Start development server**: `bun start` (runs React Cosmos)
- **Format code**: `bunx biome format --write .`
- **Run tests**: `bun test`
- **Run single test**: `bun test <test-file>`

## Architecture

### Core Pattern System

- **Small Patterns**: Reusable circuit components defined in `lib/small-patterns/`
  - `patterns-1pin/`: Single pin patterns (resistor to ground, power, voltage divider, etc.)
  - Pattern components take `pins: [number]`, `pinCount: number` props
  - Each pattern collection exports `NUM_VARIANTS` constant for combinatorics

### Circuit Generation

- **Main generator**: `pages/basic01.page.tsx` demonstrates the pattern system
- **Variant system**: Uses `getSubVariants()` to enumerate all valid combinations
- **Circuit building**: Uses `tscircuit` RootCircuit with `board` and `chip` components
- **Visualization**: `@tscircuit/schematic-viewer` renders the generated schematics

### Position Calculation

- `lib/small-patterns/utils/getPinPosition.ts` calculates pin positions on chip
- Pins are arranged vertically on right side of chip (top-to-bottom)

### Development Environment

- **React Cosmos**: Used for component development and testing (`.page.tsx` fixture files)
- **Bun**: Primary runtime and package manager
- **Biome**: Code formatting and linting
- **TypeScript**: Strict configuration with latest ESNext features
- **Vite**: Bundling via React Cosmos plugin

## Key Constraints

### Combinatorial Explosion

The number of possible schematics grows according to:

```
F(n) = SP_1 * F(n−1) + SP_2 * F(n−2) + SP_3 * F(n−3) + ...
```

Where `SP_X` is the number of small patterns spanning X pins.

### Pattern Requirements

- Patterns must not be equivalent (same netlist)
- Each pattern collection must export `NUM_VARIANTS`
- Patterns use consistent prop interface: `{ pins: number[], pinCount: number }`

## Testing

- Uses Bun test runner with SVG snapshot testing via `bun-match-svg`
- Test preload configuration in `bunfig.toml`
- SVG snapshots for visual regression testing of generated schematics

## File Naming

- Component files: PascalCase (e.g., `Pattern1Pin.tsx`)
- Other files: kebab-case as enforced by Biome
- Fixture files: `.page.tsx` suffix for Cosmos
