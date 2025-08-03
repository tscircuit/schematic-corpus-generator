import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

export const TwoPinCapacitor: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  const { pins, pinCount, slideVariations } = props
  const pin1 = pins[0]!
  const pin2 = pins[1]!

  const pin1Position = getPinPosition(pin1, pinCount)
  const pin2Position = getPinPosition(pin2, pinCount)

  const midY = (pin1Position.y + pin2Position.y) / 2

  return (
    <group>
      <capacitor
        name={`C${pin1}_${pin2}`}
        capacitance="100nF"
        schX={pin1Position.x + 1.8 + slideVariations[0] * 0.2}
        schY={midY + slideVariations[1] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin1}`,
          pin2: `U1.${pin2}`,
        }}
      />
      <resistor
        name={`R${pin1}_${pin2}`}
        resistance="1k"
        schX={pin1Position.x + 0.8 + slideVariations[0] * 0.2}
        schY={midY + slideVariations[1] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin1}`,
          pin2: `U1.${pin2}`,
        }}
      />
    </group>
  )
}

TwoPinCapacitor.usedSlideVariationDimensions = [0, 1]
