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
) => {
  // Returns the sub-variant at the given variant index, skipping those for which shouldSkip returns true
  let count = 0
  for (let i = 0; i < subVariantCounts[0]!; i++) {
    for (let j = 0; j < subVariantCounts[1]!; j++) {
      const subVariants = [i, j]
      if (shouldSkip?.(subVariants)) continue
      if (count === variant) return subVariants
      count++
    }
  }
  throw new Error("Variant index out of range")
}