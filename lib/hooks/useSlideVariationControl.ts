import { useState, useRef, useCallback, useEffect } from "react"
import { generateSlideVariationsIterator } from "../utils/slide-variation-explorer"
import type { CircuitJson } from "circuit-json"
import { detectCollisions, type CollisionInfo } from "../utils/detectCollisions"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const useSlideVariationControl = (
  pinCount: number,
  usedDimensionsPerPin?: number[][]
) => {
  const [allSlideVariations, setAllSlideVariations] = useState(
    range(pinCount).map(() => [0, 0, 0] as [number, number, number]),
  )

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0)
  const animationTimeout = useRef<NodeJS.Timeout | null>(null)
  const variationIterator = useRef<Generator<
    [number, number, number][],
    void,
    unknown
  > | null>(null)
  const [hasMoreVariations, setHasMoreVariations] = useState(true)
  const [collisionInfo, setCollisionInfo] = useState<CollisionInfo>({
    hasCollisions: false,
    collisionCount: 0,
    collidingElements: [],
  })

  // Collision detection function
  const checkCollisions = useCallback(
    (circuitJson: CircuitJson): CollisionInfo => {
      if (!circuitJson || !Array.isArray(circuitJson)) {
        return {
          hasCollisions: false,
          collisionCount: 0,
          collidingElements: [],
        }
      }

      const collisionResult = detectCollisions(circuitJson)
      setCollisionInfo(collisionResult)
      return collisionResult
    },
    [],
  )

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
    setCurrentVariationIndex((prev) => prev + 1)

    // Queue next iteration after render completes
    animationTimeout.current = setTimeout(animateNextVariation, 0) // Added small delay to make animation visible
  }, [])

  const startAnimation = useCallback(() => {
    if (isAnimating) return

    // Initialize iterator
    variationIterator.current = generateSlideVariationsIterator(pinCount, usedDimensionsPerPin)
    setIsAnimating(true)
    setCurrentVariationIndex(0)
    setHasMoreVariations(true)

    // Start the animation loop
    animateNextVariation()
  }, [isAnimating, pinCount, usedDimensionsPerPin, animateNextVariation])

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
    setAllSlideVariations(
      range(pinCount).map(() => [0, 0, 0] as [number, number, number]),
    )
  }, [pinCount])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [])

  // Enhanced animation with collision checking
  const startAnimationWithCollisionDetection = useCallback(
    (circuitJsonGetter: () => CircuitJson | null) => {
      if (isAnimating) return

      // Initialize iterator
      variationIterator.current = generateSlideVariationsIterator(pinCount, usedDimensionsPerPin)
      setIsAnimating(true)
      setCurrentVariationIndex(0)
      setHasMoreVariations(true)

      const animateWithCheck = () => {
        if (!variationIterator.current) return

        // Check for collisions before continuing
        const currentCircuitJson = circuitJsonGetter()
        if (currentCircuitJson) {
          const collisionResult = checkCollisions(currentCircuitJson)
          if (!collisionResult.hasCollisions) {
            // Stop animation when no collisions detected
            setIsAnimating(false)
            return
          }
        }

        const result = variationIterator.current.next()

        if (result.done) {
          // No more variations available
          setIsAnimating(false)
          setHasMoreVariations(false)
          return
        }

        // Update with the next variation and let React render
        setAllSlideVariations(result.value)
        setCurrentVariationIndex((prev) => prev + 1)

        // Queue next iteration after render completes
        animationTimeout.current = setTimeout(animateWithCheck, 0)
      }

      animateWithCheck()
    },
    [isAnimating, pinCount, usedDimensionsPerPin, checkCollisions],
  )

  return {
    allSlideVariations,
    setAllSlideVariations,
    isAnimating,
    currentVariationIndex,
    hasMoreVariations,
    checkCollisions,
    collisionInfo,
    startAnimation,
    startAnimationWithCollisionDetection,
    stopAnimation,
  }
}
