import React from "react"
import { RootCircuit } from "tscircuit"
import { GeneratedBoard } from "../components/GeneratedBoard"
import { detectCollisions, type CollisionInfo } from "./detectCollisions"
import { generateSlideVariationsIterator } from "./slide-variation-explorer"
import type { CircuitJson } from "circuit-json"

export interface SolverProgress {
  currentVariation: [number, number, number][]
  variationIndex: number
  collisionInfo: CollisionInfo
  isComplete: boolean
}

export interface SolverOptions {
  variant: number
  pinCount: number
  usedDimensionsPerPin?: number[][]
  onProgress?: (progress: SolverProgress) => void
  maxIterations?: number
}

export class SlideVariationSolver {
  private options: SolverOptions
  private variationIterator: Generator<
    [number, number, number][],
    void,
    unknown
  > | null = null
  private isRunning = false
  private shouldStop = false
  private currentVariationIndex = 0

  constructor(options: SolverOptions) {
    this.options = {
      maxIterations: 10000,
      ...options,
    }
  }

  /**
   * Renders a circuit with the given slide variations and returns the circuit JSON
   */
  private renderCircuit(
    slideVariations: [number, number, number][],
  ): CircuitJson | null {
    try {
      const circuit = new RootCircuit()

      circuit.add(
        <GeneratedBoard
          variant={this.options.variant}
          pinCount={this.options.pinCount}
          allSlideVariations={slideVariations}
        />,
      )

      return circuit.getCircuitJson()
    } catch (error) {
      console.error("Error rendering circuit:", error)
      return null
    }
  }

  /**
   * Checks for collisions in the given circuit JSON
   */
  private checkCollisions(circuitJson: CircuitJson): CollisionInfo {
    if (!circuitJson || !Array.isArray(circuitJson)) {
      return {
        hasCollisions: false,
        collisionCount: 0,
        collidingElements: [],
      }
    }

    return detectCollisions(circuitJson)
  }

  /**
   * Solves for the first slide variation combination with no collisions
   * Returns a promise that resolves with the solution or null if no solution found
   */
  async solve(): Promise<{
    slideVariations: [number, number, number][]
    variationIndex: number
    collisionInfo: CollisionInfo
  } | null> {
    if (this.isRunning) {
      throw new Error("Solver is already running")
    }

    this.isRunning = true
    this.shouldStop = false
    this.currentVariationIndex = 0

    // Initialize the iterator
    this.variationIterator = generateSlideVariationsIterator(
      this.options.pinCount,
      this.options.usedDimensionsPerPin,
    )

    try {
      while (
        !this.shouldStop &&
        this.currentVariationIndex < (this.options.maxIterations || 10000)
      ) {
        const result = this.variationIterator.next()

        if (result.done) {
          // No more variations to try
          break
        }

        const slideVariations = result.value

        // Render the circuit with current slide variations
        const circuitJson = this.renderCircuit(slideVariations)

        if (!circuitJson) {
          // Skip if circuit rendering failed
          this.currentVariationIndex++
          continue
        }

        // Check for collisions
        const collisionInfo = this.checkCollisions(circuitJson)

        // Notify progress
        if (this.options.onProgress) {
          this.options.onProgress({
            currentVariation: slideVariations,
            variationIndex: this.currentVariationIndex,
            collisionInfo,
            isComplete: false,
          })
        }

        // If no collisions, we found our solution!
        if (!collisionInfo.hasCollisions) {
          this.isRunning = false

          // Final progress notification
          if (this.options.onProgress) {
            this.options.onProgress({
              currentVariation: slideVariations,
              variationIndex: this.currentVariationIndex,
              collisionInfo,
              isComplete: true,
            })
          }

          return {
            slideVariations,
            variationIndex: this.currentVariationIndex,
            collisionInfo,
          }
        }

        this.currentVariationIndex++

        // Yield control to allow other operations (non-blocking)
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      // No solution found within max iterations
      this.isRunning = false
      return null
    } catch (error) {
      this.isRunning = false
      throw error
    }
  }

  /**
   * Stops the solver if it's currently running
   */
  stop(): void {
    this.shouldStop = true
  }

  /**
   * Returns whether the solver is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning
  }

  /**
   * Gets the current iteration index
   */
  getCurrentVariationIndex(): number {
    return this.currentVariationIndex
  }
}
