import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps } from "../types"

export const SinglePinResistorToGround = (props: SmallPatternProps) => {
  const { pins, pinCount } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 1}
      schY={pinPosition.y - 1}
      schRotation="-90deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: "net.GND",
      }}
    />
  )
}
