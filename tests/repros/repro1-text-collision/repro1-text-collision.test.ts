import { it, expect } from "bun:test"
import { detectCollisions } from "../../../lib/utils/detectCollisions"
import type { AnyCircuitElement } from "circuit-json"
import circuitJson from "./circuit-p5-v28.json"

it("should detect text collision in circuit-p5-v28.json", () => {
  // Load the circuit JSON data
  const circuitElements = circuitJson as AnyCircuitElement[]
  
  // Run collision detection
  const collisionInfo = detectCollisions(circuitElements)
  
  // The test should initially fail - we expect collisions to be detected
  expect(collisionInfo.hasCollisions).toBe(true)
  expect(collisionInfo.collisionCount).toBeGreaterThan(0)
  expect(collisionInfo.collidingElements.length).toBeGreaterThan(0)
  
  // Log collision details for debugging
  if (collisionInfo.hasCollisions) {
    console.log(`Found ${collisionInfo.collisionCount} collisions:`)
    collisionInfo.collidingElements.forEach((collision, index) => {
      console.log(`Collision ${index + 1}:`)
      console.log(`  Element 1: ${collision.element1.elementId} (${collision.element1.type})`)
      console.log(`  Element 2: ${collision.element2.elementId} (${collision.element2.type})`)
    })
  }
})