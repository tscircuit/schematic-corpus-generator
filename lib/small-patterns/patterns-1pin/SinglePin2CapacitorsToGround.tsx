import { getPinPosition } from "../utils/getPinPosition"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

export const SinglePin2CapacitorsToGround: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pinCount - 1, pinCount)

  return (
    <group>
      <capacitor
        name={`C${pin}_1`}
        capacitance="100nF"
        schX={pinPosition.x + 0.4 + slideVariations[0] * 0.2}
        schY={pinPosition.y - 1.2 + slideVariations[1] * 0.2}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin}`,
          pin2: "net.GND",
        }}
      />
      <capacitor
        name={`C${pin}_2`}
        capacitance="100nF"
        schX={pinPosition.x + 1.4 + slideVariations[0] * 0.2}
        schY={pinPosition.y - 1.2 + slideVariations[1] * 0.2}
        schRotation="-90deg"
        connections={{
          pin1: `U1.${pin}`,
          pin2: "net.GND",
        }}
      />
    </group>
  )
}

SinglePin2CapacitorsToGround.usedSlideVariationDimensions = [0, 1]
SinglePin2CapacitorsToGround.getCode = (props: SmallPatternProps) => {
  const { pins, pinCount, slideVariations } = props
  const pin = pins[0]!
  const pinPosition = getPinPosition(pinCount - 1, pinCount)

  return `
  <group>
    <capacitor
      name="C${pin}_1"
      capacitance="100nF"
      schX="${pinPosition.x + 0.4 + slideVariations[0] * 0.2}"
      schY="${pinPosition.y - 1.2 + slideVariations[1] * 0.2}"
      schRotation="-90deg"
      connections={{pin1: "U1.${pin}", pin2: "net.GND"}}
    />
    <capacitor
      name="C${pin}_2"
      capacitance="100nF"
      schX="${pinPosition.x + 1.4 + slideVariations[0] * 0.2}"
      schY="${pinPosition.y - 1.2 + slideVariations[1] * 0.2}"
      schRotation="-90deg"
      connections={{pin1: "U1.${pin}", pin2: "net.GND"}}
    />
  </group>`
}
