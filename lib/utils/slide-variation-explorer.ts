// Slide variation exploration utilities
import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../small-patterns/patterns-2pin/Pattern2Pin"
import type { PatternApplication } from "./variantGenerator"

/**
 * Generates dimension 1 values: [0, 1, -1, 2, -2, 3, -3, ...] up to 8
 */
function getDim1Values(): number[] {
  const values = [0]
  for (let i = 1; i <= 8; i++) {
    values.push(i, -i)
  }
  return values
}

/**
 * Get the used slide variation dimensions for each pin based on pattern applications
 */
export function getUsedDimensionsPerPin(
  patternApplications: PatternApplication[],
  pinCount: number,
): number[][] {
  // Initialize with empty arrays for each pin
  const dimensionsPerPin: number[][] = Array(pinCount)
    .fill(null)
    .map(() => [])

  // Static mapping of pattern variants to their used dimensions
  const pattern1PinUsedDimensions: Record<number, number[]> = {
    0: [], // null pattern
    1: [0], // SinglePinResistorToPower
    2: [0], // SinglePinResistorToGround
    3: [0, 1, 2], // SinglePinToVoltageDivider
    4: [0, 1], // SinglePinResistorToSignal
  }

  const pattern2PinUsedDimensions: Record<number, number[]> = {
    0: [], // null pattern
    1: [0, 1], // TwoPinResistorBridge
    2: [0, 1], // TwoPinCapacitor
    3: [0, 1], // TwoPinVoltageDivider
  }

  for (const application of patternApplications) {
    let patternDimensions: number[] = []

    if (application.patternType === "Pattern1Pin") {
      patternDimensions = pattern1PinUsedDimensions[
        application.patternVariant
      ] || [0, 1, 2]
      dimensionsPerPin[application.targetPin] = patternDimensions
    } else if (application.patternType === "Pattern2Pin") {
      patternDimensions = pattern2PinUsedDimensions[
        application.patternVariant
      ] || [0, 1, 2]
      // For 2-pin patterns, only the first pin gets slide variations
      dimensionsPerPin[application.targetPin] = patternDimensions
      // The second pin doesn't get its own slide variations since the pattern controls both pins
    }
  }

  return dimensionsPerPin
}

/**
 * Get the combined set of used slide variation dimensions from multiple patterns
 * @deprecated Use getUsedDimensionsPerPin for more precise per-pin optimization
 */
export function getUsedDimensions(
  patternApplications: PatternApplication[],
): number[] {
  const usedDimensions = new Set<number>()

  for (const application of patternApplications) {
    // Get the specific pattern component for this variant
    const patternComponent = Pattern1Pin.PATTERNS?.[application.patternVariant]

    if (patternComponent?.usedSlideVariationDimensions) {
      for (const dim of patternComponent.usedSlideVariationDimensions) {
        usedDimensions.add(dim)
      }
    } else {
      // Fallback: if not specified, assume all dimensions are used
      return [0, 1, 2]
    }
  }

  return Array.from(usedDimensions).sort()
}

const DISTANCE_BIASES = [4, 2, 1] as const
/**
 * Calculate distance for a single pin variation
 */
function calculatePinDistance(variation: [number, number, number]): number {
  const [d0, d1, d2] = variation
  return Math.sqrt(
    (d0 * d0) / DISTANCE_BIASES[0] +
      (d1 * d1) / DISTANCE_BIASES[1] +
      (d2 * d2) / DISTANCE_BIASES[2],
  )
}

/**
 * Calculate total distance for all pins
 */
function calculateTotalDistance(
  allVariations: [number, number, number][],
): number {
  return allVariations.reduce(
    (sum, variation) => sum + calculatePinDistance(variation),
    0,
  )
}

/**
 * Generator that yields slide variation combinations in order of increasing total distance.
 * This avoids memory issues by generating combinations on-demand.
 *
 * @param pinCount Number of pins to generate variations for
 * @param usedDimensionsPerPin Array of arrays, where each sub-array contains the dimensions
 *                            that should be varied for that specific pin. If not provided,
 *                            all dimensions are varied for all pins.
 */
export function* generateSlideVariationsIterator(
  pinCount: number,
  usedDimensionsPerPin?: number[][],
) {
  // Track the maximum distance we've explored so far
  let maxDistance = 0
  const distanceIncrement = 0.1
  const maxSearchDistance = 50 // Reasonable upper bound

  // Bounds from types.ts
  const dim0Max = 20
  const dim1Values = getDim1Values()
  const dim2Max = 10

  while (maxDistance <= maxSearchDistance) {
    const currentBatch: Array<{
      variations: [number, number, number][]
      distance: number
    }> = []

    // Generate all combinations within current distance threshold
    function exploreVariations(
      currentVariations: [number, number, number][],
      pinIndex: number,
    ) {
      if (pinIndex === pinCount) {
        const totalDistance = calculateTotalDistance(currentVariations)
        if (totalDistance <= maxDistance) {
          currentBatch.push({
            variations: [...currentVariations],
            distance: totalDistance,
          })
        }
        return
      }

      // Get dimensions to vary for this specific pin
      const pinUsedDimensions = usedDimensionsPerPin?.[pinIndex] || [0, 1, 2]

      // Try variations for current pin, only varying dimensions used by this pin's pattern
      const dim0Range = pinUsedDimensions.includes(0)
        ? Array.from({ length: dim0Max + 1 }, (_, i) => i)
        : [0]
      const dim1Range = pinUsedDimensions.includes(1) ? dim1Values : [0]
      const dim2Range = pinUsedDimensions.includes(2)
        ? Array.from({ length: dim2Max + 1 }, (_, i) => i)
        : [0]

      for (const dim0 of dim0Range) {
        for (const dim1 of dim1Range) {
          for (const dim2 of dim2Range) {
            const variation: [number, number, number] = [dim0, dim1, dim2]
            currentVariations[pinIndex] = variation

            // Early termination if current partial distance already exceeds threshold
            const partialDistance = currentVariations
              .slice(0, pinIndex + 1)
              .reduce((sum, v) => sum + calculatePinDistance(v), 0)

            if (partialDistance <= maxDistance) {
              exploreVariations(currentVariations, pinIndex + 1)
            }
          }
        }
      }
    }

    exploreVariations(new Array(pinCount), 0)

    // Sort current batch by distance and yield each combination
    currentBatch.sort((a, b) => a.distance - b.distance)

    for (const item of currentBatch) {
      yield item.variations
    }

    // Increase search distance for next iteration
    maxDistance += distanceIncrement
  }
}
