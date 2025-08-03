import type { PatternApplication } from "../utils/variantGenerator"

export interface FilterResult {
  passed: boolean
  reason?: string
}

export interface CircuitInfo {
  patternApplications: PatternApplication[]
  pinCount: number
  variant: number
}

/**
 * Filter for designs that have unconnected pins at the top or bottom of the chip
 */
export function filterUnconnectedTopBottomPins(
  circuitInfo: CircuitInfo,
): FilterResult {
  const { patternApplications, pinCount } = circuitInfo

  // Get all pins that have patterns applied
  const usedPins = new Set<number>()
  for (const app of patternApplications) {
    for (const pin of app.pins) {
      usedPins.add(pin)
    }
  }

  // Check if pin 1 (top) or last pin (bottom) are unconnected
  const topPin = 1
  const bottomPin = pinCount

  if (!usedPins.has(topPin)) {
    return {
      passed: false,
      reason: `Top pin (pin ${topPin}) is not connected`,
    }
  }

  if (!usedPins.has(bottomPin)) {
    return {
      passed: false,
      reason: `Bottom pin (pin ${bottomPin}) is not connected`,
    }
  }

  return { passed: true }
}

/**
 * Filter for designs with too many schematic components
 */
export function filterTooManyComponents(
  circuitInfo: CircuitInfo,
  maxComponents: number = 10,
): FilterResult {
  const { patternApplications } = circuitInfo

  // Count the total number of components that will be created
  let componentCount = 0

  for (const app of patternApplications) {
    // Each pattern application creates at least one component
    // Some patterns may create multiple components (e.g., voltage dividers create 2 resistors)
    if (app.patternType === "Pattern1Pin" && app.patternVariant === 3) {
      // SinglePinToVoltageDivider creates 2 resistors (variant 3 in Pattern1Pin)
      componentCount += 2
    } else {
      // Most patterns create 1 component
      componentCount += 1
    }
  }

  if (componentCount > maxComponents) {
    return {
      passed: false,
      reason: `Too many components: ${componentCount} > ${maxComponents}`,
    }
  }

  return { passed: true }
}

/**
 * Apply all filters to a circuit design
 */
export function applyAllFilters(
  circuitInfo: CircuitInfo,
  maxComponents: number = 10,
): FilterResult {
  const filters = [
    () => filterUnconnectedTopBottomPins(circuitInfo),
    () => filterTooManyComponents(circuitInfo, maxComponents),
  ]

  for (const filter of filters) {
    const result = filter()
    if (!result.passed) {
      return result
    }
  }

  return { passed: true }
}
