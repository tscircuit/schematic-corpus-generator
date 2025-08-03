import { SinglePinResistorToPower } from "./SinglePinResistorToPower"
import { SinglePinResistorToGround } from "./SinglePinResistorToGround"
import { SinglePinToVoltageDivider } from "./SinglePinToVoltageDivider"
import { SinglePinResistorToSignal } from "./SinglePinResistorToSignal"
import type { SmallPatternProps, SmallPatternComponent } from "../types"

const PATTERNS: SmallPatternComponent[] = [
  (props: SmallPatternProps) => null,
  SinglePinResistorToPower,
  SinglePinResistorToGround,
  SinglePinToVoltageDivider,
  SinglePinResistorToSignal,
]

export const Pattern1Pin = (props: {
  pinCount: number
  pins: [number]
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

Pattern1Pin.NUM_VARIANTS = PATTERNS.length
Pattern1Pin.PATTERNS = PATTERNS
