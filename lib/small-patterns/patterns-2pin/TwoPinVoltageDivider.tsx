import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

export const TwoPinVoltageDivider: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  const { pins, pinCount, slideVariations } = props
  const pin1 = pins[0]!
  const pin2 = pins[1]!

  const pin1Position = getPinPosition(pin1 - 1, pinCount)
  const pin2Position = getPinPosition(pin2 - 1, pinCount)

  const midY = (pin1Position.y + pin2Position.y) / 2
  const baseX = pin1Position.x + 0.6 + slideVariations[0] * 0.2

  return (
    <>
      <resistor
        name={`R${pin1}_upper`}
        resistance={2000}
        schX={baseX}
        schY={pin1Position.y - 0.3 + slideVariations[1] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin1}`,
          pin2: `net.VDD_DIV_${pin1}_${pin2}`,
        }}
      />
      <resistor
        name={`R${pin2}_lower`}
        resistance={1000}
        schX={baseX}
        schY={pin2Position.y + 0.3 + slideVariations[1] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `net.VDD_DIV_${pin1}_${pin2}`,
          pin2: `U1.${pin2}`,
        }}
      />
      <trace connections={[`net.VDD_DIV_${pin1}_${pin2}`, "net.VDD"]} />
    </>
  )
}

TwoPinVoltageDivider.usedSlideVariationDimensions = [0, 1]
