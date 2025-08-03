import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { getSubVariants } from "./getSubVariants"

export interface PatternApplication {
  targetPin: number
  patternVariant: number
  patternType: "Pattern1Pin" // Will extend for Pattern2Pin, etc.
}

/**
 * Generates the pattern applications for a given variant number.
 * This will be extended to support multiple patterns per schematic.
 */
export const generatePatternApplications = (
  variant: number,
  pinCount: number,
): PatternApplication[] => {
  const [targetPin, patternVariant] = getSubVariants(
    variant,
    [pinCount, Pattern1Pin.NUM_VARIANTS],
    (subVariants) => {
      const [pinIndex, patternVariant] = subVariants
      if (pinIndex === 0 && patternVariant === 0) return false
      if (patternVariant === 0) return true
      return false
    },
  )

  return [
    {
      targetPin: targetPin!,
      patternVariant: patternVariant!,
      patternType: "Pattern1Pin",
    },
  ]
}

/**
 * Calculates the total number of valid variants for a given pin count.
 * This accounts for the skip logic in getSubVariants.
 */
export const getTotalVariants = (pinCount: number): number => {
  let count = 0
  for (let i = 0; i < pinCount; i++) {
    for (let j = 0; j < Pattern1Pin.NUM_VARIANTS; j++) {
      if (i === 0 && j === 0) continue // Skip the base case
      if (j === 0) continue // Skip pattern variant 0 for other pins
      count++
    }
  }
  return count
}