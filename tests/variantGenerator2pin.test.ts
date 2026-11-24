import { expect, test } from "bun:test"
import { Pattern1Pin } from "../lib/small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../lib/small-patterns/patterns-2pin/Pattern2Pin"
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

test("generatePatternApplications skips the null 2-pin pattern", () => {
  const twoPinVariants: number[] = []

  const maxVariantCount =
    (Pattern1Pin.NUM_VARIANTS + Pattern2Pin.NUM_VARIANTS) ** 2
  for (let variant = 0; variant < maxVariantCount; variant++) {
    let applications
    try {
      applications = generatePatternApplications(variant, 2)
    } catch {
      break
    }

    for (const application of applications) {
      if (application.patternType === "Pattern2Pin") {
        twoPinVariants.push(application.patternVariant)
      }
    }
  }

  const expectedVariants = Array.from(
    { length: Pattern2Pin.NUM_VARIANTS - 1 },
    (_, index) => index + 1,
  )
  expect(twoPinVariants).toEqual(expectedVariants)
})
