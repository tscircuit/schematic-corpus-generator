import RBush from "rbush"
import type { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonSchematicElementsToBoundingBoxes,
  type BoundingBox,
} from "./convertCircuitJsonSchematicElementsToBoundingBoxes"

export interface CollisionInfo {
  hasCollisions: boolean
  collisionCount: number
  collidingElements: Array<{
    element1: BoundingBox
    element2: BoundingBox
  }>
}

/**
 * Detects collisions between schematic components using RBush spatial indexing
 */
export function detectCollisions(
  circuitElements: AnyCircuitElement[],
): CollisionInfo {
  const boundingBoxes =
    convertCircuitJsonSchematicElementsToBoundingBoxes(circuitElements)

  if (boundingBoxes.length < 2) {
    return {
      hasCollisions: false,
      collisionCount: 0,
      collidingElements: [],
    }
  }

  // Create and populate R-tree
  const tree = new RBush<BoundingBox>()
  tree.load(boundingBoxes)

  const collidingElements: Array<{
    element1: BoundingBox
    element2: BoundingBox
  }> = []

  // Check each bounding box for collisions
  for (const boundingBox of boundingBoxes) {
    const collisions = tree.search(boundingBox)

    // Remove self from collision results
    const otherCollisions = collisions.filter(
      (collision: BoundingBox) =>
        collision.elementId !== boundingBox.elementId &&
        collision.schematicComponentId !== boundingBox.schematicComponentId,
    )

    // Add unique collision pairs (avoid duplicates)
    for (const collision of otherCollisions) {
      const existingPair = collidingElements.find(
        (pair) =>
          (pair.element1.elementId === boundingBox.elementId &&
            pair.element2.elementId === collision.elementId) ||
          (pair.element1.elementId === collision.elementId &&
            pair.element2.elementId === boundingBox.elementId),
      )

      if (!existingPair) {
        collidingElements.push({
          element1: boundingBox,
          element2: collision,
        })
      }
    }
  }

  return {
    hasCollisions: collidingElements.length > 0,
    collisionCount: collidingElements.length,
    collidingElements,
  }
}
