import { describe, it, expect } from "bun:test"
import { detectCollisions } from "../lib/utils/detectCollisions"
import type { AnyCircuitElement } from "circuit-json"

describe("detectSchematicTextCollisions", () => {
  it("should detect collision when schematic_text overlaps with different component", () => {
    const elements: AnyCircuitElement[] = [
      {
        type: "schematic_component",
        schematic_component_id: "comp1",
        source_component_id: "src1",
        center: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
      },
      {
        type: "schematic_component",
        schematic_component_id: "comp2",
        source_component_id: "src2",
        center: { x: 2, y: 0 },
        size: { width: 1, height: 1 },
      },
      {
        type: "schematic_text",
        schematic_text_id: "text1",
        schematic_component_id: "comp1", // belongs to comp1
        text: "Test",
        font_size: 12,
        position: { x: 2, y: 0 }, // overlaps with comp2
        rotation: 0,
        anchor: "center",
        color: "black",
      },
    ]

    const result = detectCollisions(elements)

    expect(result.hasCollisions).toBe(true)
    expect(result.collisionCount).toBe(1)
    expect(result.collidingElements).toHaveLength(1)
  })

  it("should not detect collision when schematic_text is within its own component", () => {
    const elements: AnyCircuitElement[] = [
      {
        type: "schematic_component",
        schematic_component_id: "comp1",
        source_component_id: "src1",
        center: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
      },
      {
        type: "schematic_text",
        schematic_text_id: "text1",
        schematic_component_id: "comp1", // belongs to comp1
        text: "Test",
        font_size: 12,
        position: { x: 0, y: 0 }, // within comp1
        rotation: 0,
        anchor: "center",
        color: "black",
      },
    ]

    const result = detectCollisions(elements)

    expect(result.hasCollisions).toBe(false)
    expect(result.collisionCount).toBe(0)
    expect(result.collidingElements).toHaveLength(0)
  })

  it("should not detect collision when schematic_text does not overlap any component", () => {
    const elements: AnyCircuitElement[] = [
      {
        type: "schematic_component",
        schematic_component_id: "comp1",
        source_component_id: "src1",
        center: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
      },
      {
        type: "schematic_text",
        schematic_text_id: "text1",
        schematic_component_id: "comp1",
        text: "Test",
        font_size: 12,
        position: { x: 5, y: 5 }, // far from comp1
        rotation: 0,
        anchor: "center",
        color: "black",
      },
    ]

    const result = detectCollisions(elements)

    expect(result.hasCollisions).toBe(false)
    expect(result.collisionCount).toBe(0)
    expect(result.collidingElements).toHaveLength(0)
  })
})
