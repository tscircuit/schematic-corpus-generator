import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../small-patterns/patterns-2pin/Pattern2Pin"
import { SubVariantGenerator } from "./getSubVariants"

export interface PatternApplication {
  targetPin: number
  patternVariant: number
  patternType: "Pattern1Pin" | "Pattern2Pin"
  pins: number[] // Actual pin numbers that this pattern uses
}

function shouldSkipVariant(pinCount: number, subVariants: number[]): boolean {
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
}

type SubVariantCountsKey = string
const cachedSubVariantGenerators = new Map<
  SubVariantCountsKey,
  SubVariantGenerator
>()
function getSubVariantGenerator(
  pinCount: number,
  subVariantCounts: number[],
): SubVariantGenerator {
  const key = subVariantCounts.join(",")
  if (cachedSubVariantGenerators.has(key)) {
    return cachedSubVariantGenerators.get(key)!
  }
  const generator = new SubVariantGenerator(subVariantCounts, (subVariants) =>
    shouldSkipVariant(pinCount, subVariants),
  )
  cachedSubVariantGenerators.set(key, generator)
  return generator
}

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
  const subVariantCounts: number[] = Array(pinCount).fill(maxPatternsPerPin)

  const generator = getSubVariantGenerator(pinCount, subVariantCounts)

  const patternChoices = generator.get(variant)
  if (patternChoices === null) {
    throw new Error("Variant index out of range")
  }

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
 * Calculates the total number of valid variants for a given pin count using
 * the combinatorial formula from README: F(n) = SP_1 * F(n−1) + SP_2 * F(n−2) + SP_3 * F(n−3) + ..., F(0)=1
 */
export const getTotalVariants = (pinCount: number): number => {
  // SP_1 = number of 1-pin patterns (excluding null pattern)
  const SP_1 = Pattern1Pin.NUM_VARIANTS - 1
  // SP_2 = number of 2-pin patterns (excluding null pattern)
  const SP_2 = Pattern2Pin.NUM_VARIANTS - 1

  // Memoization cache
  const memo: number[] = new Array(pinCount + 1)

  const calculateF = (n: number): number => {
    if (n === 0) return 1
    if (memo[n] !== undefined) return memo[n]

    let result = 0

    // Add contribution from 1-pin patterns: SP_1 * F(n-1)
    if (n >= 1) {
      result += SP_1 * calculateF(n - 1)
    }

    // Add contribution from 2-pin patterns: SP_2 * F(n-2)
    if (n >= 2) {
      result += SP_2 * calculateF(n - 2)
    }

    memo[n] = result
    return result
  }

  return calculateF(pinCount)
}
