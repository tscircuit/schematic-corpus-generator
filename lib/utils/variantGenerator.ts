import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../small-patterns/patterns-2pin/Pattern2Pin"
import { getSubVariants } from "./getSubVariants"

export interface PatternApplication {
  targetPin: number
  patternVariant: number
  patternType: "Pattern1Pin" | "Pattern2Pin"
  pins: number[] // Actual pin numbers that this pattern uses
}

/**
 * Represents a pattern choice for a specific pin position.
 * - 0: no pattern
 * - 1-Pattern1Pin.NUM_VARIANTS: 1-pin patterns
 * - Pattern1Pin.NUM_VARIANTS+1 to Pattern1Pin.NUM_VARIANTS+Pattern2Pin.NUM_VARIANTS: 2-pin patterns
 */
type PatternChoice = number

/**
 * Generates all possible pattern applications for a given pin configuration.
 */
export const generatePatternApplications = (
  variant: number,
  pinCount: number,
): PatternApplication[] => {
  // Each pin position can have:
  // - 0: no pattern
  // - 1 to Pattern1Pin.NUM_VARIANTS-1: 1-pin patterns (variants 1 to NUM_VARIANTS-1)
  // - Pattern1Pin.NUM_VARIANTS to Pattern1Pin.NUM_VARIANTS+Pattern2Pin.NUM_VARIANTS-1: 2-pin patterns
  const maxPatternsPerPin = Pattern1Pin.NUM_VARIANTS + Pattern2Pin.NUM_VARIANTS
  const subVariantCounts = Array(pinCount).fill(maxPatternsPerPin)

  const patternChoices = getSubVariants(
    variant,
    subVariantCounts,
    (subVariants) => {
      // Skip the case where all pins have no pattern (all zeros)
      if (subVariants.every((v) => v === 0)) return true

      // Skip invalid configurations where 2-pin patterns would overlap or go out of bounds
      for (let i = 0; i < subVariants.length; i++) {
        const choice = subVariants[i]!

        // If this is a 2-pin pattern starting position
        if (choice >= Pattern1Pin.NUM_VARIANTS) {
          // Check if there's room for 2 pins
          if (i >= pinCount - 1) return true // Not enough pins remaining

          // Check if next pin is already occupied
          const nextChoice = subVariants[i + 1]!
          if (nextChoice !== 0) return true // Next pin is occupied
        }
      }

      return false
    },
  )

  const applications: PatternApplication[] = []
  const usedPins = new Set<number>()

  for (let pinIndex = 0; pinIndex < pinCount; pinIndex++) {
    if (usedPins.has(pinIndex)) continue // Skip pins already used by 2-pin patterns

    const choice = patternChoices[pinIndex]!

    if (choice === 0) {
      // No pattern
      continue
    } else if (choice < Pattern1Pin.NUM_VARIANTS) {
      // 1-pin pattern
      applications.push({
        targetPin: pinIndex,
        patternVariant: choice,
        patternType: "Pattern1Pin",
        pins: [pinIndex + 1], // Convert to 1-indexed pin numbers
      })
    } else {
      // 2-pin pattern
      const pattern2PinVariant = choice - Pattern1Pin.NUM_VARIANTS
      applications.push({
        targetPin: pinIndex,
        patternVariant: pattern2PinVariant,
        patternType: "Pattern2Pin",
        pins: [pinIndex + 1, pinIndex + 2], // Convert to 1-indexed pin numbers
      })

      // Mark the next pin as used
      usedPins.add(pinIndex + 1)
    }
  }

  return applications
}

/**
 * Calculates the total number of valid variants for a given pin count.
 * Each pin can have 1-pin patterns, 2-pin patterns, or no pattern.
 */
export const getTotalVariants = (pinCount: number): number => {
  const maxPatternsPerPin = Pattern1Pin.NUM_VARIANTS + Pattern2Pin.NUM_VARIANTS
  const totalCombinations = maxPatternsPerPin ** pinCount

  // This is an approximation - the actual number is lower due to 2-pin pattern constraints
  // but the getSubVariants function will handle filtering invalid combinations
  return totalCombinations - 1 // Subtract 1 for the all-zeros case
}
