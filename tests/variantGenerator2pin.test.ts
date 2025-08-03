import { expect, test } from "bun:test"
import { generatePatternApplications } from "../lib/utils/variantGenerator"

test("generatePatternApplications handles 2-pin patterns", () => {
  // Test with a simple 3-pin setup where we can get a 2-pin pattern
  const applications = generatePatternApplications(6, 3) // Example variant

  // Should return some applications
  expect(applications).toBeDefined()
  expect(Array.isArray(applications)).toBe(true)

  console.log("Applications:", applications)
})

test("generatePatternApplications prevents overlapping 2-pin patterns", () => {
  // Test multiple variants to ensure no invalid overlaps occur
  for (let variant = 1; variant <= 10; variant++) {
    const applications = generatePatternApplications(variant, 4)

    // Check that no two applications use overlapping pins
    const usedPins = new Set<number>()

    for (const app of applications) {
      for (const pin of app.pins) {
        if (usedPins.has(pin)) {
          throw new Error(
            `Pin ${pin} is used by multiple patterns in variant ${variant}`,
          )
        }
        usedPins.add(pin)
      }
    }
  }

  // If we get here, no overlaps were detected
  expect(true).toBe(true)
})
