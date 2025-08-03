import { generatePatternApplications } from "./variantGenerator"
import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../small-patterns/patterns-2pin/Pattern2Pin"

export function generateCircuitCode(
  variant: number,
  pinCount: number,
  allSlideVariations: Array<[number, number, number]>,
): string {
  const patternApplications = generatePatternApplications(variant, pinCount)

  const range = (n: number) => Array.from({ length: n }, (_, i) => i)

  let code = `<RootCircuit>
  <board routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        rightSide: {
          direction: "top-to-bottom",
          pins: [${range(pinCount)
            .map((p) => p + 1)
            .join(", ")}],
        },
      }}
      schX={0}
      schY={0}
      schRotation={0}
    />`

  for (const application of patternApplications) {
    const slideVars = allSlideVariations[application.targetPin]!

    if (application.patternType === "Pattern1Pin") {
      const props = {
        pins: [application.pins[0]!],
        pinCount,
        slideVariations: slideVars,
        variant: application.patternVariant,
      }

      const patternCode = Pattern1Pin.getCode(props)
      if (patternCode.trim()) {
        code += `
    ${patternCode
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("\n    ")}`
      }
    } else if (application.patternType === "Pattern2Pin") {
      const props = {
        pins: [application.pins[0]!, application.pins[1]!],
        pinCount,
        slideVariations: slideVars,
        variant: application.patternVariant,
      }

      const patternCode = Pattern2Pin.getCode(props)
      if (patternCode.trim()) {
        code += `
    ${patternCode
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("\n    ")}`
      }
    }
  }

  code += `
  </board>
</RootCircuit>`

  return code
}
