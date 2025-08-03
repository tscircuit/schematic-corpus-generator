import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

export const SinglePinToVoltageDivider: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  const centerOffset = {
    x: slideVariations[0] * 0.2,
    y: slideVariations[1] * 0.2,
  }

  return (
    <group>
      <resistor
        name={`R${pin}_1`}
        resistance={1000}
        schX={pinPosition.x + 1 + centerOffset.x}
        schY={pinPosition.y + 1 + centerOffset.y + slideVariations[2] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `net.VCC`,
          pin2: `U1.${pin}`,
        }}
      />
      <resistor
        name={`R${pin}_2`}
        resistance={1000}
        schX={pinPosition.x + 1 + centerOffset.x}
        schY={pinPosition.y - 1 + centerOffset.y - slideVariations[2] * 0.1}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin}`,
          pin2: "net.GND",
        }}
      />
    </group>
  )
}

SinglePinToVoltageDivider.usedSlideVariationDimensions = [0, 1, 2]
SinglePinToVoltageDivider.getCode = (props: SmallPatternProps) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pin, pinCount)

  const centerOffset = {
    x: slideVariations[0] * 0.2,
    y: slideVariations[1] * 0.2,
  }

  return `
  <group>
    <resistor
      name="R${pin}_1"
      resistance="1000"
      schX="${pinPosition.x + 1 + centerOffset.x}"
      schY="${pinPosition.y + 1 + centerOffset.y + slideVariations[2] * 0.1}"
      schRotation="-90deg"
      connections={{pin1: "net.VCC", pin2: "U1.${pin}"}}
    />
    <resistor
      name="R${pin}_2"
      resistance="1000"
      schX="${pinPosition.x + 1 + centerOffset.x}"
      schY="${pinPosition.y - 1 + centerOffset.y - slideVariations[2] * 0.1}"
      schRotation="-90deg"
      connections={{pin1: "U1.${pin}", pin2: "net.GND"}}
    />
  </group>`
}
