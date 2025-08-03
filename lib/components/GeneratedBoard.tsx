import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { generatePatternApplications } from "../utils/variantGenerator"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const GeneratedBoard = ({
  variant,
  pinCount,
  allSlideVariations,
}: {
  variant: number
  pinCount: number
  allSlideVariations: Array<[number, number, number]>
}) => {
  const patternApplications = generatePatternApplications(variant, pinCount)

  return (
    <board routingDisabled>
      <chip
        name="U1"
        schPinArrangement={{
          rightSide: {
            direction: "top-to-bottom",
            pins: range(pinCount).map((p) => p + 1),
          },
        }}
        schX={0}
        schY={0}
        schRotation={0}
      />
      {patternApplications.map((application, index) => (
        <Pattern1Pin
          key={`pattern-${application.targetPin}-${application.patternVariant}`}
          pinCount={pinCount}
          pins={[application.targetPin + 1]}
          variant={application.patternVariant}
          slideVariations={
            allSlideVariations[index % allSlideVariations.length]!
          }
        />
      ))}
    </board>
  )
}
