import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "../lib/components/Toolbar"
import { GeneratedBoard } from "../lib/components/GeneratedBoard"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { generateSlideVariationsIterator } from "../lib/utils/slide-variation-explorer"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export default () => {
  const [pinCount, setPinCount] = useState(3)
  const [variant, setVariant] = useState(() => {
    const stored = localStorage.getItem("lastVariant")
    return stored !== null ? Number(stored) : 1
  })

  const [allSlideVariations, setAllSlideVariations] = useState(
    range(pinCount).map(() => [0, 0, 0] as [number, number, number]),
  )

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0)
  const animationTimeout = useRef<NodeJS.Timeout | null>(null)
  const variationIterator = useRef<Generator<[number, number, number][], void, unknown> | null>(null)
  const [hasMoreVariations, setHasMoreVariations] = useState(true)

  useEffect(() => {
    localStorage.setItem("lastVariant", String(variant))
  }, [variant])

  // Future collision detection function (placeholder)
  const hasCollisions = useCallback((circuitJson: any): boolean => {
    // TODO: Implement collision detection logic
    // This should analyze the circuitJson to detect component overlaps
    // For now, return false to continue animation
    return false
  }, [])

  // Animation control functions
  const animateNextVariation = useCallback(() => {
    if (!variationIterator.current) return
    
    const result = variationIterator.current.next()
    
    if (result.done) {
      // No more variations available
      setIsAnimating(false)
      setHasMoreVariations(false)
      return
    }
    
    // Update with the next variation and let React render
    setAllSlideVariations(result.value)
    setCurrentVariationIndex(prev => prev + 1)
    
    // Queue next iteration after render completes
    animationTimeout.current = setTimeout(animateNextVariation, 0)
  }, [])

  const startAnimation = useCallback(() => {
    if (isAnimating) return
    
    // Initialize iterator
    variationIterator.current = generateSlideVariationsIterator(pinCount)
    setIsAnimating(true)
    setCurrentVariationIndex(0)
    setHasMoreVariations(true)
    
    // Start the animation loop
    animateNextVariation()
  }, [isAnimating, pinCount, animateNextVariation])

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current)
      animationTimeout.current = null
    }
  }, [])

  // Reset iterator when pin count changes
  useEffect(() => {
    setCurrentVariationIndex(0)
    setHasMoreVariations(true)
    // Reset slide variations to all zeros
    setAllSlideVariations(range(pinCount).map(() => [0, 0, 0] as [number, number, number]))
  }, [pinCount])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [])

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
