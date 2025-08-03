import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps } from "../types"

export const SinglePinResistorToSignal = (props: SmallPatternProps) => {
  const { pins, pinCount } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 1}
      schY={pinPosition.y}
      schRotation="0deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: `net.SIG${pin}`,
      }}
    />
  )
}
