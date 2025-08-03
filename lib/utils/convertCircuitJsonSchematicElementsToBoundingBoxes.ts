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
 * Supports schematic_component, schematic_text, and schematic_net_label elements
 */
export function convertCircuitJsonSchematicElementsToBoundingBoxes(
  elements: AnyCircuitElement[],
): BoundingBox[] {
  const boundingBoxes: BoundingBox[] = []

  for (const element of elements) {
    if (element.type === "schematic_component") {
      const { center, size } = element
      const halfWidth = size.width / 2
      let halfHeight = size.height / 2

      // Check if symbol has vertical orientation (_up or _down) which would render labels to the right
      const hasVerticalSymbol =
        element.symbol_name &&
        (element.symbol_name.includes("_up") ||
          element.symbol_name.includes("_down"))
      const hasHorizontalSymbol =
        element.symbol_name &&
        (element.symbol_name.includes("_left") ||
          element.symbol_name.includes("_right"))

      // Add extra space on the right for vertical symbols to account for rendered labels
      const verticalExtension = hasVerticalSymbol ? 0.3 : 0
      if (hasHorizontalSymbol) {
        halfHeight += 0.15
      }

      boundingBoxes.push({
        minX: center.x - halfWidth,
        minY: center.y - halfHeight,
        maxX: center.x + halfWidth + verticalExtension,
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
    } else if (element.type === "schematic_net_label") {
      // schematic_net_label is treated as a 0.4x0.2 box around the center
      // Net labels are typically wider than they are tall
      const { center, anchor_position } = element
      const halfWidth = Math.max(0.1, Math.abs(center.x - anchor_position!.x))
      const halfHeight = Math.max(0.1, Math.abs(center.y - anchor_position!.y))

      boundingBoxes.push({
        minX: center.x - halfWidth,
        minY: center.y - halfHeight,
        maxX: center.x + halfWidth,
        maxY: center.y + halfHeight,
        elementId: element.schematic_net_label_id,
        elementType: "schematic_net_label",
      })
    }
  }

  return boundingBoxes
}
