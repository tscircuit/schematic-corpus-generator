import type { AnyCircuitElement } from "circuit-json"

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  elementId: string
  elementType: string
}

/**
 * Converts Circuit JSON schematic elements into bounding boxes for collision detection
 * Currently focuses on schematic_component elements
 */
export function convertCircuitJsonSchematicElementsToBoundingBoxes(
  elements: AnyCircuitElement[],
): BoundingBox[] {
  const boundingBoxes: BoundingBox[] = []

  for (const element of elements) {
    if (element.type === "schematic_component") {
      const { center, size } = element
      const halfWidth = size.width / 2
      const halfHeight = size.height / 2

      boundingBoxes.push({
        minX: center.x - halfWidth,
        minY: center.y - halfHeight,
        maxX: center.x + halfWidth,
        maxY: center.y + halfHeight,
        elementId: element.schematic_component_id,
        elementType: "schematic_component",
      })
    }
  }

  return boundingBoxes
}
