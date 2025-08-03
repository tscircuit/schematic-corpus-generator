import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { Toolbar } from "../lib/components/Toolbar"
import { GeneratedBoard } from "../lib/components/GeneratedBoard"
import { CodeDisplay } from "../lib/components/CodeDisplay"
import { useEffect, useMemo, useState } from "react"
import { useSlideVariationControl } from "../lib/hooks/useSlideVariationControl"
import { generatePatternApplications } from "../lib/utils/variantGenerator"
import { getUsedDimensionsPerPin } from "../lib/utils/slide-variation-explorer"

export default () => {
  const [pinCount, setPinCount] = useState(5)
  const [variant, setVariant] = useState(() => {
    const stored = localStorage.getItem("lastVariant")
    return stored !== null ? Number(stored) : 1
  })

  // Calculate which slideVariation dimensions are used by each pin's pattern
  const patternApplications = useMemo(
    () => generatePatternApplications(variant, pinCount),
    [variant, pinCount],
  )
  const usedDimensionsPerPin = useMemo(
    () => getUsedDimensionsPerPin(patternApplications, pinCount),
    [patternApplications, pinCount],
  )

  const {
    allSlideVariations,
    setAllSlideVariations,
    isAnimating,
    currentVariationIndex,
    hasMoreVariations,
    checkCollisions,
    collisionInfo,
    startSmartAnimation,
    stopAnimation,
  } = useSlideVariationControl(pinCount, usedDimensionsPerPin)

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
      <div
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          margin: "10px 0",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Slide Variation Animation</h3>
        <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
          Exploring slide variation combinations for {pinCount} pins with
          per-pin dimension optimization:
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
            {usedDimensionsPerPin.map((dims, i) => (
              <div key={i}>
                Pin {i + 1}: dimensions [{dims.join(", ") || "none"}]
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => startSmartAnimation(variant)}
            disabled={isAnimating}
            style={{ marginRight: "10px" }}
          >
            Start Smart Animation
          </button>
          <button onClick={stopAnimation} disabled={!isAnimating}>
            Stop Animation
          </button>
        </div>

        <div>
          <span>Variations explored: {currentVariationIndex}</span>
          {isAnimating && (
            <span style={{ marginLeft: "10px", color: "green" }}>
              ● Animating
            </span>
          )}
          {!hasMoreVariations && (
            <span style={{ marginLeft: "10px", color: "orange" }}>
              ● Exploration complete
            </span>
          )}
        </div>

        {/* Collision Detection Status */}
        <div
          style={{
            marginTop: "10px",
            padding: "5px",
            backgroundColor: "#f5f5f5",
            borderRadius: "3px",
          }}
        >
          <strong>Collision Status:</strong>{" "}
          {circuitJson ? (
            collisionInfo.hasCollisions ? (
              <span style={{ color: "red" }}>
                ⚠ {collisionInfo.collisionCount} collision
                {collisionInfo.collisionCount !== 1 ? "s" : ""} detected
              </span>
            ) : (
              <span style={{ color: "green" }}>✓ No collisions detected</span>
            )
          ) : (
            <span style={{ color: "#666" }}>Loading...</span>
          )}
          {circuitJson && (
            <button
              onClick={() => checkCollisions(circuitJson)}
              style={{
                marginLeft: "10px",
                fontSize: "12px",
                padding: "2px 6px",
              }}
            >
              Check Now
            </button>
          )}
        </div>

        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          Current variations:{" "}
          {allSlideVariations
            .map((v, i) => `Pin${i + 1}:[${v.join(",")}]`)
            .join(" ")}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#888",
            marginTop: "5px",
            fontStyle: "italic",
          }}
        >
          Smart Animation will auto-stop when no collisions are detected.
        </div>
      </div>
      {error && <div style={{ color: "red" }}>{error.toString()}</div>}
      {circuitJson && (
        <div>
          <SchematicViewer
            key={`${pinCount}-${variant}`}
            circuitJson={circuitJson}
            containerStyle={{
              height: 500,
            }}
            debugGrid
          />
          <button
            onClick={() => {
              const dataStr = JSON.stringify(circuitJson, null, 2)
              const dataBlob = new Blob([dataStr], { type: "application/json" })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement("a")
              link.href = url
              link.download = `circuit-p${pinCount}-v${variant}.json`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Download Circuit JSON
          </button>
          <CodeDisplay
            variant={variant}
            pinCount={pinCount}
            allSlideVariations={allSlideVariations}
          />
        </div>
      )}
    </div>
  )
}
