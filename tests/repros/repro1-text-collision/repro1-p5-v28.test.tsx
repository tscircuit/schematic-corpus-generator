import { it, expect } from "bun:test"
import {
  SlideVariationSolver,
  type SolverProgress,
} from "../../../lib/utils/SlideVariationSolver"
import { RootCircuit } from "tscircuit"
import { GeneratedBoard } from "../../../lib/components/GeneratedBoard"
import { detectCollisions } from "../../../lib/utils/detectCollisions"
import type { CircuitJson } from "circuit-json"

it("should solve variant 28 with 5 pins and log variations explored", async () => {
  console.log("Starting SlideVariationSolver for variant 28 with 5 pins...")

  let variationsExplored = 0
  let lastLogTime = Date.now()

  const solver = new SlideVariationSolver({
    variant: 28,
    pinCount: 5,
    maxIterations: 10000, // Limit iterations for this test
    onProgress: (progress: SolverProgress) => {
      variationsExplored++

      // Log progress every 100 variations or every 2 seconds
      const now = Date.now()
      if (variationsExplored % 100 === 0 || now - lastLogTime > 2000) {
        console.log(
          `Variation ${progress.variationIndex}: ${progress.collisionInfo.hasCollisions ? "COLLISION" : "NO COLLISION"} (${progress.collisionInfo.collisionCount} collisions)`,
        )
        console.log(
          `  Slide variations: ${JSON.stringify(progress.currentVariation)}`,
        )
        lastLogTime = now
      }

      if (progress.isComplete) {
        console.log("✓ Solution found!")
        console.log(
          `Final slide variations: ${JSON.stringify(progress.currentVariation)}`,
        )
      }
    },
  })

  console.log("Solving...")
  const result = await solver.solve()

  console.log(`\n=== SOLVER RESULTS ===`)
  console.log(`Total variations explored: ${variationsExplored}`)

  if (result) {
    console.log(`✓ Solution found at variation ${result.variationIndex}`)
    console.log(
      `Solution slide variations: ${JSON.stringify(result.slideVariations)}`,
    )
    console.log(
      `Final collision status: ${result.collisionInfo.hasCollisions ? "HAS COLLISIONS" : "NO COLLISIONS"}`,
    )
  } else {
    console.log(
      `✗ No solution found within ${solver.getCurrentVariationIndex()} iterations`,
    )
  }

  // Extract circuit JSON from the solved result for confirmation
  if (result) {
    console.log(`\n=== EXTRACTING FINAL CIRCUIT JSON ===`)
    console.log(
      `Solution slide variations: ${JSON.stringify(result.slideVariations)}`,
    )

    // Render the circuit with the solution slide variations to extract final JSON
    const circuit = new RootCircuit()
    circuit.add(
      <GeneratedBoard
        variant={28}
        pinCount={5}
        allSlideVariations={result.slideVariations}
      />,
    )

    const finalCircuitJson = circuit.getCircuitJson() as CircuitJson
    console.log(
      `Extracted circuit JSON with ${finalCircuitJson.length} elements`,
    )

    // Log positions of all schematic components and text elements
    console.log(`\n=== ELEMENT POSITIONS ===`)

    const schematicComponents = finalCircuitJson.filter(
      (el) => el.type === "schematic_component",
    )
    const schematicTexts = finalCircuitJson.filter(
      (el) => el.type === "schematic_text",
    )

    console.log(`\nSchematic Components (${schematicComponents.length}):`)
    for (const comp of schematicComponents) {
      const name = comp.symbol_display_value || comp.name || "unnamed"
      console.log(
        `  ${comp.schematic_component_id}: "${name}" at center (${comp.center.x}, ${comp.center.y})`,
      )
      if (comp.size) {
        console.log(`    Size: ${comp.size.width} × ${comp.size.height}`)
      }
      if (comp.symbol_name) {
        console.log(`    Symbol: ${comp.symbol_name}`)
      }
    }

    console.log(`\nSchematic Text Elements (${schematicTexts.length}):`)
    for (const text of schematicTexts) {
      const textContent = text.text || "(empty)"
      console.log(
        `  ${text.schematic_text_id}: "${textContent}" at position (${text.position.x}, ${text.position.y})`,
      )
      if (text.anchor) {
        console.log(`    Anchor: ${text.anchor}`)
      }
      if (text.font_size) {
        console.log(`    Font size: ${text.font_size}`)
      }
      if (text.schematic_component_id) {
        console.log(
          `    Associated with component: ${text.schematic_component_id}`,
        )
      }
    }

    // Run collision detection on the extracted circuit JSON for double confirmation
    console.log(`\n=== COLLISION DETECTION CONFIRMATION ===`)
    const extractedCollisionInfo = detectCollisions(finalCircuitJson)
    const solverCollisionInfo = result.collisionInfo

    console.log(`Solver collision results:`)
    console.log(`  Has collisions: ${solverCollisionInfo.hasCollisions}`)
    console.log(`  Collision count: ${solverCollisionInfo.collisionCount}`)

    console.log(`Extracted circuit collision results:`)
    console.log(`  Has collisions: ${extractedCollisionInfo.hasCollisions}`)
    console.log(`  Collision count: ${extractedCollisionInfo.collisionCount}`)

    if (extractedCollisionInfo.hasCollisions) {
      console.log(`  Colliding elements:`)
      extractedCollisionInfo.collidingElements.forEach((collision, index) => {
        console.log(
          `    Collision ${index + 1}: ${collision.element1.elementId} (${collision.element1.elementType}) vs ${collision.element2.elementId} (${collision.element2.elementType})`,
        )
      })
    } else {
      console.log(`  ✓ Confirmed: No collisions in final extracted circuit`)
    }

    // Test assertions for both collision detection results
    expect(solverCollisionInfo.hasCollisions).toBe(false)
    expect(solverCollisionInfo.collisionCount).toBe(0)
    expect(extractedCollisionInfo.hasCollisions).toBe(false)
    expect(extractedCollisionInfo.collisionCount).toBe(0)
    expect(finalCircuitJson.length).toBeGreaterThan(0)
  }

  // Test assertions
  expect(variationsExplored).toBeGreaterThan(0)
  expect(result).not.toBeNull()
  expect(result?.collisionInfo.hasCollisions).toBe(false)
  expect(result?.slideVariations).toBeDefined()
  expect(Array.isArray(result?.slideVariations)).toBe(true)
  expect(result?.slideVariations.length).toBe(5) // 5 pins
}, 30000) // 30 second timeout
