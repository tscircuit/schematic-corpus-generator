import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps } from "../types"

export const SinglePinResistorToPower = ({
  pins,
  pinCount,
  slideVariations,
}: SmallPatternProps) => {
  const pin = pins[0]!
  const pinPosition = getPinPosition(1, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 0.4 + slideVariations[0] * 0.2}
      schY={pinPosition.y + 1}
      schRotation="90deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: "net.VCC",
      }}
    />
  )
}
