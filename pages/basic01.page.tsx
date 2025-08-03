import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "../lib/components/Toolbar"
import { GeneratedBoard } from "../lib/components/GeneratedBoard"
import { useEffect, useMemo, useState } from "react"
import { useSlideVariationControl } from "../lib/hooks/useSlideVariationControl"

export default () => {
  const [pinCount, setPinCount] = useState(3)
  const [variant, setVariant] = useState(() => {
    const stored = localStorage.getItem("lastVariant")
    return stored !== null ? Number(stored) : 1
  })

  const {
    allSlideVariations,
    setAllSlideVariations,
    isAnimating,
    currentVariationIndex,
    hasMoreVariations,
    hasCollisions,
    startAnimation,
    stopAnimation,
  } = useSlideVariationControl(pinCount)

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
      
      {/* Animation Controls */}
      <div style={{ 
        padding: '10px', 
        border: '1px solid #ccc', 
        margin: '10px 0',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Slide Variation Animation</h3>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          Exploring all possible slide variation combinations for all {pinCount} pins, ordered by lowest total distance
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={startAnimation} 
            disabled={isAnimating}
            style={{ marginRight: '10px' }}
          >
            Start Animation
          </button>
          <button 
            onClick={stopAnimation} 
            disabled={!isAnimating}
          >
            Stop Animation
          </button>
        </div>
        
        <div>
          <span>Variations explored: {currentVariationIndex}</span>
          {isAnimating && <span style={{ marginLeft: '10px', color: 'green' }}>● Animating</span>}
          {!hasMoreVariations && <span style={{ marginLeft: '10px', color: 'orange' }}>● Exploration complete</span>}
        </div>
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Current variations: {allSlideVariations.map((v, i) => `Pin${i+1}:[${v.join(',')}]`).join(' ')}
        </div>
        
        <div style={{ fontSize: '11px', color: '#888', marginTop: '5px', fontStyle: 'italic' }}>
          Future: Animation will auto-stop when no collisions detected in circuit
        </div>
      </div>
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
