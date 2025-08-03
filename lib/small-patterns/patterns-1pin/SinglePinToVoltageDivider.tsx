import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps } from "../types"

export const SinglePinToVoltageDivider = (props: SmallPatternProps) => {
  const { pins, pinCount } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <group>
      <resistor
        name={`R${pin}_1`}
        resistance={1000}
        schX={pinPosition.x + 1}
        schY={pinPosition.y + 1}
        schRotation="-90deg"
        connections={{
          pin1: `net.VCC`,
          pin2: `U1.${pin}`,
        }}
      />
      <resistor
        name={`R${pin}_2`}
        resistance={1000}
        schX={pinPosition.x + 1}
        schY={pinPosition.y - 1}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin}`,
          pin2: "net.GND",
        }}
      />
    </group>
  )
}
