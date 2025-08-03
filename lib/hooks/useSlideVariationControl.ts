import { useState, useRef, useCallback, useEffect } from "react"
import { generateSlideVariationsIterator } from "../utils/slide-variation-explorer"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const useSlideVariationControl = (pinCount: number) => {
  const [allSlideVariations, setAllSlideVariations] = useState(
    range(pinCount).map(() => [0, 0, 0] as [number, number, number]),
  )

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0)
  const animationTimeout = useRef<NodeJS.Timeout | null>(null)
  const variationIterator = useRef<Generator<[number, number, number][], void, unknown> | null>(null)
  const [hasMoreVariations, setHasMoreVariations] = useState(true)

  // Future collision detection function (placeholder)
  const hasCollisions = useCallback((circuitJson: any): boolean => {
    // TODO: Implement collision detection logic
    // This should analyze the circuitJson to detect component overlaps
    // For now, return false to continue animation
    return false
  }, [])

  // Animation control functions
  const animateNextVariation = useCallback(() => {
    if (!variationIterator.current) return
    
    const result = variationIterator.current.next()
    
    if (result.done) {
      // No more variations available
      setIsAnimating(false)
      setHasMoreVariations(false)
      return
    }
    
    // Update with the next variation and let React render
    setAllSlideVariations(result.value)
    setCurrentVariationIndex(prev => prev + 1)
    
    // Queue next iteration after render completes
    animationTimeout.current = setTimeout(animateNextVariation, 0)
  }, [])

  const startAnimation = useCallback(() => {
    if (isAnimating) return
    
    // Initialize iterator
    variationIterator.current = generateSlideVariationsIterator(pinCount)
    setIsAnimating(true)
    setCurrentVariationIndex(0)
    setHasMoreVariations(true)
    
    // Start the animation loop
    animateNextVariation()
  }, [isAnimating, pinCount, animateNextVariation])

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current)
      animationTimeout.current = null
    }
  }, [])

  // Reset iterator when pin count changes
  useEffect(() => {
    setCurrentVariationIndex(0)
    setHasMoreVariations(true)
    // Reset slide variations to all zeros
    setAllSlideVariations(range(pinCount).map(() => [0, 0, 0] as [number, number, number]))
  }, [pinCount])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [])

  return {
    allSlideVariations,
    setAllSlideVariations,
    isAnimating,
    currentVariationIndex,
    hasMoreVariations,
    hasCollisions,
    startAnimation,
    stopAnimation,
  }
}