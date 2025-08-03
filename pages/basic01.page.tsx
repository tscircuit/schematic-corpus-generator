import { Pattern1Pin } from "../lib/small-patterns/patterns-1pin/Pattern1Pin"
import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "./components/Toolbar"
import { useEffect, useMemo, useState } from "react"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/**
 * Takes a variant number and lists all the sub-variants that shouldn't be skipped.
 *
 *   getSubVariants(1, [3,4])
 *   // [ [0,0], [0, 1], [0, 2], [0, 3],
 *   //   [1,0], [1, 1], [1, 2], [1, 3],
 *   //   [2,0], [2, 1], [2, 2], [2, 3] ]
 */
const getSubVariants = (
  variant: number,
  subVariantCounts: number[],
  shouldSkip?: (subVariants: number[]) => boolean,
) => {
  // Returns the sub-variant at the given variant index, skipping those for which shouldSkip returns true
  let count = 0
  for (let i = 0; i < subVariantCounts[0]!; i++) {
    for (let j = 0; j < subVariantCounts[1]!; j++) {
      const subVariants = [i, j]
      if (shouldSkip?.(subVariants)) continue
      if (count === variant) return subVariants
      count++
    }
  }
  throw new Error("Variant index out of range")
}

export const GeneratedBoard = ({
  variant,
  pinCount,
}: {
  variant: number
  pinCount: number
}) => {
  const [targetPin, patternVariant] = getSubVariants(
    variant,
    [pinCount, Pattern1Pin.NUM_VARIANTS],
    (subVariants) => {
      const [pinIndex, patternVariant] = subVariants
      if (pinIndex === 0 && patternVariant === 0) return false
      if (patternVariant === 0) return true
      return false
    },
  )

  return (
    <board routingDisabled>
      <chip
        name="U1"
        schPinArrangement={{
          rightSide: {
            direction: "top-to-bottom",
            pins: range(pinCount).map((p) => p + 1),
          },
        }}
        schX={0}
        schY={0}
        schRotation={0}
      />
      <Pattern1Pin
        pinCount={pinCount}
        pins={[targetPin! + 1]}
        variant={patternVariant!}
      />
    </board>
  )
}

export default () => {
  const [pinCount, setPinCount] = useState(3)
  const [variant, setVariant] = useState(() => {
    const stored = localStorage.getItem("lastVariant")
    return stored !== null ? Number(stored) : 1
  })

  useEffect(() => {
    localStorage.setItem("lastVariant", String(variant))
  }, [variant])

  const [circuitJson, error] = useMemo(() => {
    try {
      const circuit = new RootCircuit()

      circuit.add(<GeneratedBoard variant={variant} pinCount={pinCount} />)

      return [circuit.getCircuitJson(), null]
    } catch (e) {
      console.error(e)
      return [null, e]
    }
  }, [variant, pinCount])

  return (
    <div>
      <Toolbar
        variant={variant}
        pinCount={pinCount}
        onChangeVariant={setVariant}
        onChangePinCount={setPinCount}
      />
      {error && <div style={{ color: "red" }}>{error.toString()}</div>}
      {circuitJson && (
        <SchematicViewer
          key={`${pinCount}-${variant}`}
          circuitJson={circuitJson}
          containerStyle={{
            height: 500,
          }}
        />
      )}
    </div>
  )
}
