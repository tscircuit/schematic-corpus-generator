import { TwoPinCapacitor } from "./TwoPinCapacitor"
import type { SmallPatternProps, SmallPatternComponent } from "../types"
import { TwoPinCapacitorAndResistor } from "./TwoPinCapacitorAndResistor"

const PATTERNS: SmallPatternComponent[] = [
  (props: SmallPatternProps) => null,
  TwoPinCapacitor,
  TwoPinCapacitorAndResistor,
]

export const Pattern2Pin = (props: {
  pinCount: number
  pins: [number, number]
  variant: number
  slideVariations: [number, number, number]
}) => {
  const { pins, variant, pinCount } = props

  const Pattern = PATTERNS[variant]

  if (!Pattern) {
    throw new Error(`Invalid variant: ${variant}`)
  }

  return (
    <Pattern
      pins={pins}
      pinCount={pinCount}
      slideVariations={props.slideVariations}
    />
  )
}

Pattern2Pin.NUM_VARIANTS = PATTERNS.length
Pattern2Pin.PATTERNS = PATTERNS
