import { test } from "bun:test"
import assert from "node:assert/strict"
import {
  applyAllFilters,
  filterTooManyComponents,
  type CircuitInfo,
} from "../lib/codegen/filters"
import type { PatternApplication } from "../lib/utils/variantGenerator"

function application(
  patternType: PatternApplication["patternType"],
  patternVariant: number,
  pins: number[],
): PatternApplication {
  return { patternType, patternVariant, pins, targetPin: pins[0]! - 1 }
}

function circuit(
  patternApplications: PatternApplication[],
  pinCount: number,
  variant = 0,
): CircuitInfo {
  return { patternApplications, pinCount, variant }
}

// Independent counts from the named components and getCode bodies selected by
// Pattern1Pin.PATTERNS / Pattern2Pin.PATTERNS. These are unit tests, not rendering.
// The fixed main chip is outside this filter's existing applied-pattern count.
const patterns: Array<{
  type: PatternApplication["patternType"]
  variant: number
  label: string
  count: number
  pins: number[]
}> = [
  { type: "Pattern1Pin", variant: 1, label: "resistor to power", count: 1, pins: [1] },
  { type: "Pattern1Pin", variant: 2, label: "resistor to ground", count: 1, pins: [1] },
  { type: "Pattern1Pin", variant: 3, label: "two-resistor divider", count: 2, pins: [1] },
  { type: "Pattern1Pin", variant: 4, label: "resistor to signal", count: 1, pins: [1] },
  { type: "Pattern1Pin", variant: 5, label: "two capacitors", count: 2, pins: [1] },
  { type: "Pattern1Pin", variant: 6, label: "three capacitors", count: 3, pins: [1] },
  { type: "Pattern1Pin", variant: 7, label: "four capacitors", count: 4, pins: [1] },
  { type: "Pattern2Pin", variant: 1, label: "two-pin capacitor", count: 1, pins: [1, 2] },
  { type: "Pattern2Pin", variant: 2, label: "two-pin capacitor and resistor", count: 2, pins: [1, 2] },
]

for (const pattern of patterns) {
  const input = circuit(
    [application(pattern.type, pattern.variant, pattern.pins)],
    pattern.pins.length,
  )
  if (pattern.count > 1) {
    test(`${pattern.label} exceeds a smaller positive allowance`, () => {
      const limit = pattern.count - 1
      assert.deepEqual(filterTooManyComponents(input, limit), {
        passed: false,
        reason: `Too many components: ${pattern.count} > ${limit}`,
      })
    })
  }
  test(`${pattern.label} fits exactly at its component count`, () => {
    assert.deepEqual(filterTooManyComponents(input, pattern.count), { passed: true })
  })
  test(`${pattern.label} fits above its component count`, () => {
    assert.deepEqual(filterTooManyComponents(input, pattern.count + 1), { passed: true })
  })
}

for (const type of ["Pattern1Pin", "Pattern2Pin"] as const) {
  test(`${type} null pattern adds no component to a resistor`, () => {
    // NullPattern returns null and its getCode returns an empty string.
    const pins = type === "Pattern1Pin" ? [2] : [2, 3]
    const input = circuit(
      [application("Pattern1Pin", 1, [1]), application(type, 0, pins)],
      pins[pins.length - 1]!,
    )
    assert.deepEqual(filterTooManyComponents(input, 1), { passed: true })
  })
}

const checkedInDesign = circuit(
  [application("Pattern1Pin", 1, [1]), application("Pattern1Pin", 7, [2])],
  2,
  14,
)

test("p2-v14's resistor and four capacitors exceed four applied components", () => {
  // Matches generated-designs/p2-v14.circuit.tsx, excluding its fixed U1.
  assert.deepEqual(applyAllFilters(checkedInDesign, 4), {
    passed: false,
    reason: "Too many components: 5 > 4",
  })
})

test("p2-v14's five applied components fit exactly", () => {
  assert.deepEqual(applyAllFilters(checkedInDesign, 5), { passed: true })
})

test("the default allowance rejects twelve applied capacitors", () => {
  const input = circuit(
    [1, 2, 3].map((pin) => application("Pattern1Pin", 7, [pin])),
    3,
  )
  assert.deepEqual(filterTooManyComponents(input), {
    passed: false,
    reason: "Too many components: 12 > 10",
  })
})

test("the default allowance includes ten applied components", () => {
  const input = circuit(
    [
      application("Pattern1Pin", 7, [1]),
      application("Pattern1Pin", 7, [2]),
      application("Pattern1Pin", 3, [3]),
    ],
    3,
  )
  assert.deepEqual(filterTooManyComponents(input), { passed: true })
})

test("unconnected top pins still fail before the component limit", () => {
  assert.deepEqual(
    applyAllFilters(circuit([application("Pattern1Pin", 7, [2])], 2), 1),
    { passed: false, reason: "Top pin (pin 1) is not connected" },
  )
})

test("unconnected bottom pins still fail before the component limit", () => {
  assert.deepEqual(
    applyAllFilters(circuit([application("Pattern1Pin", 7, [1])], 2), 1),
    { passed: false, reason: "Bottom pin (pin 2) is not connected" },
  )
})

test("component filtering does not mutate the input or its applications", () => {
  const input = structuredClone(checkedInDesign)
  const before = structuredClone(input)
  for (const app of input.patternApplications) {
    Object.freeze(app.pins)
    Object.freeze(app)
  }
  Object.freeze(input.patternApplications)
  Object.freeze(input)
  assert.equal(filterTooManyComponents(input, 4).passed, false)
  assert.deepEqual(input, before)
})

test("an empty application list retains its component-filter behavior", () => {
  assert.deepEqual(filterTooManyComponents(circuit([], 1)), { passed: true })
})

for (const type of ["Pattern1Pin", "Pattern2Pin"] as const) {
  test(`${type} unknown numeric variants retain the one-component fallback`, () => {
    // Compatibility characterization only, not a newly supported pattern.
    const pins = type === "Pattern1Pin" ? [1] : [1, 2]
    assert.deepEqual(
      filterTooManyComponents(circuit([application(type, 99, pins)], pins.length), 1),
      { passed: true },
    )
  })
}
