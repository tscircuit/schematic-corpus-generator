import type { AnyCircuitElement } from "circuit-json"

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  elementId: string
  elementType: string
  schematicComponentId?: string // For schematic_text, this links to its component
}

/**
 * Converts Circuit JSON schematic elements into bounding boxes for collision detection
 * Supports schematic_component and schematic_text elements
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
        schematicComponentId: element.schematic_component_id,
        elementType: "schematic_component",
      })
    } else if (element.type === "schematic_text") {
      // schematic_text is treated as a 0.3x0.3 box around the center
      const { position, anchor } = element
      // TODO use anchor to determine which direction the text grows in
      const halfSize = 0.15

      boundingBoxes.push({
        minX: position.x - halfSize,
        minY: position.y - halfSize,
        maxX: position.x + halfSize,
        maxY: position.y + halfSize,
        elementId: element.schematic_text_id,
        elementType: "schematic_text",
        schematicComponentId: element.schematic_component_id,
      })
    }
  }

  return boundingBoxes
}
