import { useState } from "react"
import { generateCircuitCode } from "../utils/generateCircuitCode"

interface CodeDisplayProps {
  variant: number
  pinCount: number
  allSlideVariations: Array<[number, number, number]>
}

export const CodeDisplay = ({
  variant,
  pinCount,
  allSlideVariations,
}: CodeDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const code = generateCircuitCode(variant, pinCount, allSlideVariations)

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
  }

  return (
    <div
      style={{
        marginTop: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          padding: "10px",
          borderBottom: isExpanded ? "1px solid #ccc" : "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>
          Circuit Code {isExpanded ? "▼" : "▶"}
        </h3>
        <div>
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard()
              }}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            padding: "10px",
          }}
        >
          <pre
            style={{
              backgroundColor: "#f4f4f4",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
              fontFamily: "Monaco, Consolas, 'Lucida Console', monospace",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  )
}
