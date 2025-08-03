import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { getSubVariants } from "./getSubVariants"

export interface PatternApplication {
  targetPin: number
  patternVariant: number
  patternType: "Pattern1Pin" // Will extend for Pattern2Pin, etc.
}

/**
 * Generates the pattern applications for a given variant number.
 * Supports multiple Pattern1Pin applications per schematic.
 */
export const generatePatternApplications = (
  variant: number,
  pinCount: number,
): PatternApplication[] => {
  // Generate all combinations: each pin can have any pattern variant (including 0 = no pattern)
  const subVariantCounts = Array(pinCount).fill(Pattern1Pin.NUM_VARIANTS)
  
  const patternSelections = getSubVariants(
    variant,
    subVariantCounts,
    (subVariants) => {
      // Skip the case where all pins have no pattern (all zeros)
      return subVariants.every(v => v === 0)
    },
  )

  const applications: PatternApplication[] = []
  
  for (let pinIndex = 0; pinIndex < pinCount; pinIndex++) {
    const patternVariant = patternSelections[pinIndex]!
    
    // Only add patterns that are not variant 0 (no pattern)
    if (patternVariant !== 0) {
      applications.push({
        targetPin: pinIndex,
        patternVariant,
        patternType: "Pattern1Pin",
      })
    }
  }

  return applications
}

/**
 * Calculates the total number of valid variants for a given pin count.
 * Each pin can have any of the Pattern1Pin variants, excluding the all-zeros case.
 */
export const getTotalVariants = (pinCount: number): number => {
  const totalCombinations = Pattern1Pin.NUM_VARIANTS ** pinCount
  return totalCombinations - 1 // Subtract 1 for the all-zeros case
}