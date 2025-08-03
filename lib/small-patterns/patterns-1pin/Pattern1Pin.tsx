import { SinglePinResistorToPower } from "./SinglePinResistorToPower"
import { SinglePinResistorToGround } from "./SinglePinResistorToGround"
import { SinglePinToVoltageDivider } from "./SinglePinToVoltageDivider"
import { SinglePinResistorToSignal } from "./SinglePinResistorToSignal"
import type { SmallPatternProps, SmallPatternComponent } from "../types"
import { SinglePin2CapacitorsToGround } from "./SinglePin2CapacitorsToGround"
import { SinglePin3CapacitorsToGround } from "./SinglePin3CapacitorsToGround"
import { SinglePin4CapacitorsToGround } from "./SinglePin4CapacitorsToGround"
import { NullPattern } from "../NullPattern"

const PATTERNS: SmallPatternComponent[] = [
  NullPattern,
  SinglePinResistorToPower,
  SinglePinResistorToGround,
  SinglePinToVoltageDivider,
  SinglePinResistorToSignal,
  SinglePin2CapacitorsToGround,
  SinglePin3CapacitorsToGround,
  SinglePin4CapacitorsToGround,
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
Pattern1Pin.getCode = (props: SmallPatternProps & { variant: number }) => {
  const { pins, pinCount, slideVariations, variant } = props
  const Pattern = PATTERNS[variant]

  if (!Pattern) {
    throw new Error(`Invalid variant: ${variant}`)
  }

  return Pattern.getCode({ pins, pinCount, slideVariations })
}
