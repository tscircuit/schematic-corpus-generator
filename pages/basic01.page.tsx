import { Pattern1Pin } from "../lib/small-patterns/patterns-1pin/Pattern1Pin"
import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "./components/Toolbar"
import { useState } from "react"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const GeneratedBoard = ({
  variant,
  pinCount,
}: {
  variant: number
  pinCount: number
}) => (
  <board>
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
    <Pattern1Pin pins={[1]} variant={variant} />
  </board>
)

export default () => {
  const [pinCount, setPinCount] = useState(3)
  const [variant, setVariant] = useState(1)

  const circuit = new RootCircuit()

  circuit.add(<GeneratedBoard variant={variant} pinCount={pinCount} />)

  const circuitJson = circuit.getCircuitJson()

  return (
    <div>
      <Toolbar
        variant={variant}
        pinCount={pinCount}
        onChangeVariant={setVariant}
        onChangePinCount={setPinCount}
      />
      <SchematicViewer
        key={`${pinCount}-${variant}`}
        circuitJson={circuitJson}
        containerStyle={{
          height: 500,
        }}
      />
    </div>
  )
}
