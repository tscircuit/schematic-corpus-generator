import { expect, test } from "bun:test"
import { Pattern2Pin } from "../lib/small-patterns/patterns-2pin/Pattern2Pin"

test("Pattern2Pin has correct number of variants", () => {
  expect(Pattern2Pin.NUM_VARIANTS).toBe(4)
})

test("Pattern2Pin throws error for invalid variant", () => {
  expect(() => {
    Pattern2Pin({
      pinCount: 2,
      pins: [1, 2],
      variant: 99, // invalid variant
      slideVariations: [0, 0, 0],
    })
  }).toThrow("Invalid variant: 99")
})

test("Pattern2Pin with valid variant returns component", () => {
  const result = Pattern2Pin({
    pinCount: 2,
    pins: [1, 2],
    variant: 1, // TwoPinResistorBridge
    slideVariations: [0, 0, 0],
  })

  expect(result).not.toBe(null)
  expect(typeof result).toBe("object")
})
