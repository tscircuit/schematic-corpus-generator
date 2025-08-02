# schematic-generator

This project is a tool for generating right-facing schematic patterns with a simple autolayout.

The schematics generated always feature a "chip" on the left and passives or other chips on
the right. The left-side chip only has pins on the right side (like a jumper)

We want to generate every possible schematic that can be created by connecting
each pin to a pre-defined "small pattern"

For example, let's say we have two small patterns:

- P1: Single Pin, DOLO (disconnected or line/label only)
- P2: Single Pin, connected to a resistor, resistor connected to ground

If we have a chip with 3 pins, we can generate 8 different schematics:

- P1, P1, P1
- P1, P2, P1
- P1, P1, P2
- P1, P2, P2
- P2, P1, P1
- P2, P2, P1
- P2, P1, P2
- P2, P2, P2

We create each schematic and then "adjust the layout" to avoid overlaps.

It is also possible to have small patterns that span multiple pins e.g.

- P3: Two Pins, directly connected (DOLO)
- P4: Two Pins, mutually connected by resistor
- P5: Two Pins, mutually connected to terminal of resistor, resistor connected to ground

## Notes on Combinatorics

We want to be careful with our small pattern definitions. They should never be
"equivalent" in the sense that the netlist is identical (we detect this using
the `bpc-graph` module) and we want to make sure there aren't too many such that
we have too many schematics to store in memory.

The general equation for computing the number of possible schematics is:

```
F(n)= SP_1 * F(n−1) + SP_2 * F(n−2) + SP_3 * F(n−3) + ..., F(0)=1
```

- `SP_1` is the number of small patterns that are single pins
- `SP_X` is the number of small patterns that are `X` pins
- `F(n)` is the number of possible schematics for a chip with `n` pins

If we have the following numbers of small patterns:

- SP_1 = 3
- SP_2 = 10
- SP_3 = 20

We would have **3,163 schematics.**:

- $F(1)=3$
- $F(2)=3\cdot3+10=19$
- $F(3)=3\cdot19+10\cdot3+20=107$
- $F(4)=3\cdot107+10\cdot19+20\cdot3=571$
- $F(5)=3\cdot571+10\cdot107+20\cdot19=\mathbf{3{,}163}$.

In general, it takes about `1MB` to store 1,000 schematics in memory when they
are compressed, so storing 3,163 schematics would take about `3.163MB`.
