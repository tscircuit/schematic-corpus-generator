import { Pattern1Pin } from "../small-patterns/patterns-1pin/Pattern1Pin"
import { getSubVariants } from "../utils/getSubVariants"

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
  const [targetPin, patternVariant] = getSubVariants(
    variant,
    [pinCount, Pattern1Pin.NUM_VARIANTS],
    (subVariants) => {
      const [pinIndex, patternVariant] = subVariants
      if (pinIndex === 0 && patternVariant === 0) return false
      if (patternVariant === 0) return true
      return false
    },
  )

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
      <Pattern1Pin
        pinCount={pinCount}
        pins={[targetPin! + 1]}
        variant={patternVariant!}
        slideVariations={allSlideVariations[0]!}
      />
    </board>
  )
}