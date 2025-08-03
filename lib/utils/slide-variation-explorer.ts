// Slide variation exploration utilities

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
 * Calculate distance for a single pin variation
 */
function calculatePinDistance(variation: [number, number, number]): number {
  const [d0, d1, d2] = variation
  return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2)
}

/**
 * Calculate total distance for all pins
 */
function calculateTotalDistance(allVariations: [number, number, number][]): number {
  return allVariations.reduce((sum, variation) => sum + calculatePinDistance(variation), 0)
}

/**
 * Generator that yields slide variation combinations in order of increasing total distance.
 * This avoids memory issues by generating combinations on-demand.
 */
export function* generateSlideVariationsIterator(pinCount: number) {
  // Track the maximum distance we've explored so far
  let maxDistance = 0
  const distanceIncrement = 0.1
  const maxSearchDistance = 50 // Reasonable upper bound
  
  // Bounds from types.ts
  const dim0Max = 20
  const dim1Values = getDim1Values()
  const dim2Max = 10
  
  while (maxDistance <= maxSearchDistance) {
    const currentBatch: Array<{variations: [number, number, number][], distance: number}> = []
    
    // Generate all combinations within current distance threshold
    function exploreVariations(
      currentVariations: [number, number, number][],
      pinIndex: number
    ) {
      if (pinIndex === pinCount) {
        const totalDistance = calculateTotalDistance(currentVariations)
        if (totalDistance <= maxDistance) {
          currentBatch.push({
            variations: [...currentVariations],
            distance: totalDistance
          })
        }
        return
      }

      // Try variations for current pin
      for (let dim0 = 0; dim0 <= dim0Max; dim0++) {
        for (const dim1 of dim1Values) {
          for (let dim2 = 0; dim2 <= dim2Max; dim2++) {
            const variation: [number, number, number] = [dim0, dim1, dim2]
            currentVariations[pinIndex] = variation
            
            // Early termination if current partial distance already exceeds threshold
            const partialDistance = currentVariations.slice(0, pinIndex + 1)
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