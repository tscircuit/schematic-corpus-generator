import { expect, test } from "bun:test"
import { Pattern1Pin } from "../lib/small-patterns/patterns-1pin/Pattern1Pin"

test("Pattern1Pin has correct number of variants", () => {
  expect(Pattern1Pin.NUM_VARIANTS).toBe(5)
})

test("Pattern1Pin throws error for invalid variant", () => {
  expect(() => {
    Pattern1Pin({
      pinCount: 1,
      pins: [1],
      variant: 99, // invalid variant
      slideVariations: [0, 0, 0],
    })
  }).toThrow("Invalid variant: 99")
})

test("Pattern1Pin with valid variant returns component", () => {
  const result = Pattern1Pin({
    pinCount: 1,
    pins: [1],
    variant: 1, // SinglePinResistorToPower
    slideVariations: [0, 0, 0],
  })

  expect(result).not.toBe(null)
  expect(typeof result).toBe("object")
})
