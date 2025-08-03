import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

export const SinglePinResistorToSignal: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 1 + slideVariations[0] * 0.2}
      schY={pinPosition.y + slideVariations[1] * 0.2}
      schRotation="0deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: `net.SIG${pin}`,
      }}
    />
  )
}

SinglePinResistorToSignal.usedSlideVariationDimensions = [0, 1]
SinglePinResistorToSignal.getCode = (props: SmallPatternProps) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  return `
  <resistor
    name="R${pin}"
    resistance="1000"
    schX="${pinPosition.x + 1 + slideVariations[0] * 0.2}"
    schY="${pinPosition.y + slideVariations[1] * 0.2}"
    schRotation="0deg"
    connections={{pin1: "U1.${pin}", pin2: "net.SIG${pin}"}}
  />`
}
