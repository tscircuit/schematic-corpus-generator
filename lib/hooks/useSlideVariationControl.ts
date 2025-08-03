import { useState, useCallback, useEffect } from "react"
import type { CircuitJson } from "circuit-json"
import { detectCollisions, type CollisionInfo } from "../utils/detectCollisions"
import {
  SlideVariationSolver,
  type SolverProgress,
} from "../utils/SlideVariationSolver"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const useSlideVariationControl = (
  pinCount: number,
  usedDimensionsPerPin?: number[][],
) => {
  const [allSlideVariations, setAllSlideVariations] = useState(
    range(pinCount).map(() => [0, 0, 0] as [number, number, number]),
  )

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0)
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

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
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

  // Enhanced animation with collision checking using SlideVariationSolver
  const startSmartAnimation = useCallback(
    async (variant: number) => {
      if (isAnimating) return

      setIsAnimating(true)
      setCurrentVariationIndex(0)
      setHasMoreVariations(true)

      const solver = new SlideVariationSolver({
        variant,
        pinCount,
        usedDimensionsPerPin,
        onProgress: (progress: SolverProgress) => {
          setAllSlideVariations(progress.currentVariation)
          setCurrentVariationIndex(progress.variationIndex)
          setCollisionInfo(progress.collisionInfo)

          if (progress.isComplete) {
            setIsAnimating(false)
            setHasMoreVariations(false)
          }
        },
        maxIterations: 10000,
      })

      try {
        const solution = await solver.solve()

        if (solution) {
          setAllSlideVariations(solution.slideVariations)
          setCollisionInfo(solution.collisionInfo)
        } else {
          setHasMoreVariations(false)
        }
      } catch (error) {
        console.error("Smart animation failed:", error)
      } finally {
        setIsAnimating(false)
      }
    },
    [isAnimating, pinCount, usedDimensionsPerPin],
  )

  return {
    allSlideVariations,
    setAllSlideVariations,
    isAnimating,
    currentVariationIndex,
    hasMoreVariations,
    checkCollisions,
    collisionInfo,
    startSmartAnimation,
    stopAnimation,
  }
}
