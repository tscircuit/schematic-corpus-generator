/**
 * Takes a variant number and lists all the sub-variants that shouldn't be skipped.
 *
 *   getSubVariants(1, [3,4])
 *   // [ [0,0], [0, 1], [0, 2], [0, 3],
 *   //   [1,0], [1, 1], [1, 2], [1, 3],
 *   //   [2,0], [2, 1], [2, 2], [2, 3] ]
 */
export const getSubVariants = (
  variant: number,
  subVariantCounts: number[],
  shouldSkip?: (subVariants: number[]) => boolean,
): number[] => {
  // Returns the sub-variant at the given variant index, skipping those for which shouldSkip returns true
  let count = 0
  
  const generateCombinations = (counts: number[], current: number[] = []): number[][] => {
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
  
  const allCombinations = generateCombinations(subVariantCounts)
  
  for (const subVariants of allCombinations) {
    if (shouldSkip?.(subVariants)) continue
    if (count === variant) return subVariants
    count++
  }
  
  throw new Error("Variant index out of range")
}