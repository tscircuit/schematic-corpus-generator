import { SinglePinResistorToPower } from "./SinglePinResistorToPower"
import { SinglePinResistorToGround } from "./SinglePinResistorToGround"
import { SinglePinToVoltageDivider } from "./SinglePinToVoltageDivider"
import { SinglePinResistorToSignal } from "./SinglePinResistorToSignal"

const PATTERNS = [
  (props: { pins: [number] }) => null,
  SinglePinResistorToPower,
  SinglePinResistorToGround,
  SinglePinToVoltageDivider,
  SinglePinResistorToSignal,
]

export const Pattern1Pin = (props: { pins: [number]; variant: number }) => {
  const { pins, variant } = props

  const Pattern = PATTERNS[variant]

  if (!Pattern) {
    throw new Error(`Invalid variant: ${variant}`)
  }

  return <Pattern pins={pins} />
}
