/**
 * Takes a variant number and lists all the sub-variants that shouldn't be skipped.
 *
 *   getSubVariants(1, [3,4])
 *   // [ [0,0], [0, 1], [0, 2], [0, 3],
 *   //   [1,0], [1, 1], [1, 2], [1, 3],
 *   //   [2,0], [2, 1], [2, 2], [2, 3] ]
 */
// Memoization cache for sub-variant combinations keyed by the
// `subVariantCounts` array stringified with commas.  This avoids
// recomputing Cartesian products when the same shape is requested
// repeatedly during a single runtime.
const combinationsCache = new Map<string, number[][]>()

const generateCombinations = (
  counts: number[],
  current: number[] = [],
): number[][] => {
  if (current.length === counts.length) {
    return [current]
  }

  const results: number[][] = []
  const currentIndex = current.length
  for (let i = 0; i < counts[currentIndex]!; i++) {
    results.push(...generateCombinations(counts, [...current, i]))
  }
  return results
}

export const getSubVariants = (
  variant: number,
  subVariantCounts: number[],
  shouldSkip?: (subVariants: number[]) => boolean,
): number[] => {
  // Returns the sub-variant at the given variant index, skipping those for which shouldSkip returns true
  let count = 0

  const key = subVariantCounts.join(",")
  const allCombinations =
    combinationsCache.get(key) ??
    (() => {
      const combos = generateCombinations(subVariantCounts)
      combinationsCache.set(key, combos)
      return combos
    })()

  for (const subVariants of allCombinations) {
    if (shouldSkip?.(subVariants)) continue
    if (count === variant) return subVariants
    count++
  }

  throw new Error("Variant index out of range")
}

/**
 * An optimized generator class that lazily generates sub-variants instead of computing all at once.
 * Supports both sequential .next() calls and random access via .get(v).
 */
export class SubVariantGenerator {
  private subVariantCounts: number[]
  private shouldSkip?: (subVariants: number[]) => boolean
  private generatedVariants: Map<number, number[]> = new Map()
  private currentVariantIndex = 0
  private maxIndex: number | null = null
  private allCombinations: number[][]
  // Index of the next element in `allCombinations` to examine. This lets us
  // avoid re-scanning already-processed combinations and guarantees that every
  // generated variant is cached exactly once.
  private nextCombinationIndex = 0

  constructor(
    subVariantCounts: number[],
    shouldSkip?: (subVariants: number[]) => boolean,
  ) {
    this.subVariantCounts = subVariantCounts
    this.shouldSkip = shouldSkip

    this.allCombinations =
      combinationsCache.get(subVariantCounts.join(",")) ??
      generateCombinations(subVariantCounts, [])
  }

  /**
   * Gets the next variant in sequence. Returns null if no more variants exist.
   */
  next(): number[] | null {
    const result = this.get(this.currentVariantIndex)
    if (result !== null) {
      this.currentVariantIndex++
    }
    return result
  }

  /**
   * Gets the variant at the specified index. Uses memoization to avoid recomputation.
   */
  get(variantIndex: number): number[] | null {
    // Check if we already computed this variant
    if (this.generatedVariants.has(variantIndex)) {
      return this.generatedVariants.get(variantIndex)!
    }

    // If we know the max index and the requested index exceeds it, return null
    if (this.maxIndex !== null && variantIndex > this.maxIndex) {
      return null
    }

    while (!this.generatedVariants.has(variantIndex)) {
      const subVariants = this.allCombinations[this.nextCombinationIndex]
      if (subVariants === undefined) {
        break
      }
      this.nextCombinationIndex++
      if (this.shouldSkip?.(subVariants)) {
        continue
      }
      const newVariantIndex = this.generatedVariants.size
      this.generatedVariants.set(newVariantIndex, subVariants)
    }

    return this.generatedVariants.get(variantIndex) ?? null
  }

  /**
   * Gets the total number of valid variants (computed lazily).
   */
  getTotalCount(): number {
    if (this.maxIndex !== null) {
      return this.maxIndex + 1
    }

    // Force generation of all variants to determine the count
    let count = 0
    while (this.get(count) !== null) {
      count++
    }
    return count
  }
}
