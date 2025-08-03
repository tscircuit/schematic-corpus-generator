import { getPinPosition } from "../utils/getPinPosition"

export const SinglePinResistorToSignal = (props: {
  pins: [number]
  pinCount: number
}) => {
  const { pins, pinCount } = props
  const [pin] = pins
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 1}
      schY={pinPosition.y}
      schRotation="0deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: `net.SIG${pin}`,
      }}
    />
  )
}
