import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "./components/Toolbar"
import { GeneratedBoard } from "../lib/components/GeneratedBoard"
import { useEffect, useMemo, useState } from "react"

export default () => {
  const [pinCount, setPinCount] = useState(3)
  const [variant, setVariant] = useState(() => {
    const stored = localStorage.getItem("lastVariant")
    return stored !== null ? Number(stored) : 1
  })

  const [allSlideVariations, setAllSlideVariations] = useState([
    [0, 0, 0] as [number, number, number],
  ])

  useEffect(() => {
    localStorage.setItem("lastVariant", String(variant))
  }, [variant])

  const [circuitJson, error] = useMemo(() => {
    try {
      const circuit = new RootCircuit()

      circuit.add(
        <GeneratedBoard
          variant={variant}
          pinCount={pinCount}
          allSlideVariations={allSlideVariations}
        />,
      )

      return [circuit.getCircuitJson(), null]
    } catch (e) {
      console.error(e)
      return [null, e as any]
    }
  }, [variant, pinCount, allSlideVariations])

  return (
    <div>
      <Toolbar
        variant={variant}
        pinCount={pinCount}
        allSlideVariations={allSlideVariations}
        onChangeVariant={setVariant}
        onChangePinCount={setPinCount}
        onChangeAllSlideVariations={setAllSlideVariations}
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
